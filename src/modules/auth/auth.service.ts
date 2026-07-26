import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { verify } from 'argon2'
import { StringValue } from 'ms'
import { isDev, noop } from '@shared/utils'
import { FavoritesService } from '@modules/favorites/favorites.service'
import { UserService } from '../user/user.service'
import { AuthAccountService } from './auth-account/auth-account.service'
import { AuthSessionService } from './auth-session/auth-session.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import {
  ACCESS_TOKEN_COOKIE_NAME,
  CURRENT_SESSION_REVOKE_ERROR,
  FAILED_TO_CREATE_USER_ERROR,
  INVALID_CREDENTIALS_ERROR,
  INVALID_REFRESH_TOKEN_ERROR,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_NOT_FOUND_ERROR,
} from './auth.constants'
import { ONE_DAY_IN_MS, ONE_HOUR_IN_MS } from '@shared/constants'
import {
  AccessTokenPayload,
  AuthSessionItem,
  AuthSessionsResponse,
  AuthFavoriteAwareUser,
  PreparedRequest,
  RefreshTokenPayload,
  AuthSocialProfile,
  UserWithoutPassword,
} from './auth.types'
import { extractAuthSessionMetadata } from './auth.utils'
import { getAuthSessionDeviceLabel } from './auth-session/auth-session.utils'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly userService: UserService,
    private readonly favoritesService: FavoritesService,
    private readonly configService: ConfigService,
    private readonly authAccountService: AuthAccountService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async register(dto: RegisterDto, request: PreparedRequest) {
    const createdUser = await this.userService.create(dto)

    if (!createdUser) {
      throw new InternalServerErrorException(FAILED_TO_CREATE_USER_ERROR)
    }

    const user = await this.mergeAuthFavorites(
      createdUser,
      dto.favoriteProductIds,
    )

    await this.authAccountService.requestEmailVerification(user)

    return this.createSession(user, request)
  }

  async login(dto: LoginDto, request: PreparedRequest) {
    const validatedUser = await this.validateUser(dto)

    const user = await this.mergeAuthFavorites(
      validatedUser,
      dto.favoriteProductIds,
    )

    return this.createSession(user, request)
  }

  async socialLogin(profile: AuthSocialProfile) {
    const user = await this.resolveSocialUser(profile)

    if (!user) {
      throw new InternalServerErrorException(FAILED_TO_CREATE_USER_ERROR)
    }

    return user
  }

  async logout(refreshToken?: string) {
    const verifiedRefreshToken = await this.verifyRefreshToken(refreshToken)

    if (!verifiedRefreshToken) return true

    await this.authSessionService.deleteByUserIdAndSessionId(
      verifiedRefreshToken.id,
      verifiedRefreshToken.jti,
    )

    return true
  }

  async getSessions(
    userId: string,
    refreshToken?: string,
  ): Promise<AuthSessionsResponse> {
    const currentSessionId = await this.getCurrentSessionId(refreshToken)

    const authSessions = await this.authSessionService.findActiveByUserId(userId)

    const sessions = authSessions
      .map<AuthSessionItem>((authSession) => ({
        sessionId: authSession.sessionId,
        deviceLabel: getAuthSessionDeviceLabel(authSession.userAgent),
        ip: authSession.ip,
        lastUsedAt: authSession.lastUsedAt ?? authSession.createdAt,
        createdAt: authSession.createdAt,
        isCurrent: authSession.sessionId === currentSessionId,
      }))
      .sort(
        (firstSession, secondSession) =>
          Number(secondSession.isCurrent) - Number(firstSession.isCurrent) ||
          secondSession.lastUsedAt.getTime() - firstSession.lastUsedAt.getTime(),
      )

    return { sessions }
  }

  async revokeSession(
    userId: string,
    sessionId: string,
    refreshToken?: string,
  ) {
    const currentSessionId = await this.getCurrentSessionId(refreshToken)

    if (currentSessionId === sessionId) {
      throw new BadRequestException(CURRENT_SESSION_REVOKE_ERROR)
    }

    await this.authSessionService.deleteByUserIdAndSessionId(userId, sessionId)

    return true
  }

  async logoutAll(userId: string) {
    await this.authSessionService.deleteAllByUserId(userId)

    return true
  }

  setAuthTokens(
    response: Response,
    accessToken: string | null,
    refreshToken: string | null,
  ) {
    const accessTokenExpiresHours = this.configService.getOrThrow<number>(
      'JWT_ACCESS_TOKEN_EXPIRES_HOURS',
    )

    const accessTokenExpires = new Date(
      Date.now() + accessTokenExpiresHours * ONE_HOUR_IN_MS,
    )

    const refreshTokenExpiresDays = this.configService.getOrThrow<number>(
      'JWT_REFRESH_TOKEN_EXPIRES_DAYS',
    )

    const refreshTokenExpires = new Date(
      Date.now() + refreshTokenExpiresDays * ONE_DAY_IN_MS,
    )

    const defaultCookieOptions = {
      httpOnly: true,
      secure: true,
      domain: this.configService.get<string>('COOKIE_DOMAIN'),
      sameSite: isDev(this.configService) ? 'none' : 'strict',
    } as const

    response.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      ...defaultCookieOptions,
      expires: accessToken ? accessTokenExpires : new Date(0),
    })

    response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...defaultCookieOptions,
      expires: refreshToken ? refreshTokenExpires : new Date(0),
    })
  }

  async getNewTokens(refreshToken: string, request: PreparedRequest) {
    const verifiedRefreshToken = await this.verifyRefreshToken(refreshToken)

    if (!verifiedRefreshToken) {
      throw new BadRequestException(INVALID_REFRESH_TOKEN_ERROR)
    }

    const authSession = await this.authSessionService.findByUserIdAndSessionId(
      verifiedRefreshToken.id,
      verifiedRefreshToken.jti,
    )

    if (!authSession) {
      return this.handleTrustedInvalidRefreshToken(verifiedRefreshToken.id)
    }

    if (authSession.expiresAt.getTime() <= Date.now()) {
      await this.authSessionService.deleteByUserIdAndSessionId(
        verifiedRefreshToken.id,
        verifiedRefreshToken.jti,
      )

      throw new BadRequestException(INVALID_REFRESH_TOKEN_ERROR)
    }

    const isRefreshTokenValid = await this.authSessionService.matchesRefreshToken(
      authSession,
      refreshToken,
    )

    if (!isRefreshTokenValid) {
      return this.handleTrustedInvalidRefreshToken(verifiedRefreshToken.id)
    }

    const user = await this.userService.getById(verifiedRefreshToken.id)

    if (!user) {
      await this.authSessionService.deleteAllByUserId(verifiedRefreshToken.id)

      throw new NotFoundException(USER_NOT_FOUND_ERROR)
    }

    const sessionTokens = this.generateSessionTokens(
      user,
      verifiedRefreshToken.jti,
    )

    const didRotateSession =
      await this.authSessionService.rotateIfRefreshTokenHashMatches({
        userId: verifiedRefreshToken.id,
        sessionId: verifiedRefreshToken.jti,
        refreshToken: sessionTokens.refreshToken,
        expiresAt: sessionTokens.refreshTokenExpiresAt,
        currentRefreshTokenHash: authSession.refreshTokenHash,
        ...extractAuthSessionMetadata(request),
      })

    if (!didRotateSession) {
      return this.handleTrustedInvalidRefreshToken(verifiedRefreshToken.id)
    }

    return {
      user,
      accessToken: sessionTokens.accessToken,
      refreshToken: sessionTokens.refreshToken,
    }
  }

  async createSession(user: UserWithoutPassword, request: PreparedRequest) {
    const sessionId = randomUUID()
    const sessionTokens = this.generateSessionTokens(user, sessionId)

    await this.authSessionService.create({
      userId: String(user._id),
      sessionId,
      refreshToken: sessionTokens.refreshToken,
      expiresAt: sessionTokens.refreshTokenExpiresAt,
      ...extractAuthSessionMetadata(request),
    })

    return {
      user,
      accessToken: sessionTokens.accessToken,
      refreshToken: sessionTokens.refreshToken,
    }
  }

  private async verifyRefreshToken(refreshToken?: string | null) {
    if (!refreshToken) return null

    return this.jwt
      .verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      })
      .catch(() => null)
  }

  private async validateUser(data: LoginDto) {
    const { email, password } = data

    const user = await this.userService.getByEmailWithPassword(email)

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_ERROR)
    }

    const isPasswordValid = await verify(user.password, password)

    if (!isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_ERROR)
    }

    const { password: userPassword, ...safeUser } = user

    noop(userPassword)

    return safeUser
  }

  private async resolveSocialUser(profile: AuthSocialProfile) {
    const userByProvider = await this.userService.getBySocialProvider(
      profile.provider,
      profile.providerId,
    )

    if (userByProvider) return userByProvider

    const existingUser = await this.userService.getByEmail(profile.email)

    if (existingUser) {
      return this.userService.linkSocialProvider(
        existingUser._id,
        profile.provider,
        profile.providerId,
      )
    }

    return this.userService.createSocialUser(profile)
  }

  private async mergeAuthFavorites<TUser extends AuthFavoriteAwareUser>(
    user: TUser,
    favoriteProductIds?: string[],
  ) {
    if (!favoriteProductIds?.length) {
      return {
        ...user,
        favoriteProductIds: user.favoriteProductIds ?? [],
      }
    }

    const mergedFavoriteProductIds =
      await this.favoritesService.mergeFavoriteProductIds(
        String(user._id),
        favoriteProductIds,
      )

    return {
      ...user,
      favoriteProductIds: mergedFavoriteProductIds,
    }
  }

  private generateSessionTokens(
    user: UserWithoutPassword,
    sessionId: string,
  ) {
    const accessTokenPayload: AccessTokenPayload = {
      id: String(user._id),
      role: user.role,
    }

    const refreshTokenPayload: RefreshTokenPayload = {
      id: String(user._id),
      jti: sessionId,
    }

    const accessToken = this.jwt.sign(accessTokenPayload, {
      expiresIn: this.configService.get<StringValue>(
        'JWT_ACCESS_TOKEN_EXPIRES_IN',
      ),
    })

    const refreshToken = this.jwt.sign(refreshTokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<StringValue>(
        'JWT_REFRESH_TOKEN_EXPIRES_IN',
      ),
    })

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: this.getRefreshTokenExpiresAt(),
    }
  }

  private getRefreshTokenExpiresAt() {
    const refreshTokenExpiresDays = this.configService.getOrThrow<number>(
      'JWT_REFRESH_TOKEN_EXPIRES_DAYS',
    )

    return new Date(Date.now() + refreshTokenExpiresDays * ONE_DAY_IN_MS)
  }

  private async handleTrustedInvalidRefreshToken(userId: string): Promise<never> {
    await this.authSessionService.deleteAllByUserId(userId)

    throw new BadRequestException(INVALID_REFRESH_TOKEN_ERROR)
  }

  private async getCurrentSessionId(refreshToken?: string) {
    const verifiedRefreshToken = await this.verifyRefreshToken(refreshToken)

    return verifiedRefreshToken?.jti ?? null
  }
}
