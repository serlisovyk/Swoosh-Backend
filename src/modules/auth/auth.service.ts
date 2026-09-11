import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { verify } from 'argon2'
import ms, { StringValue } from 'ms'
import { isDev, noop } from '@shared/utils'
import { FavoritesService } from '@modules/favorites/favorites.service'
import { UserService } from '../user/user.service'
import { AuthAccountService } from './auth-account/auth-account.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import {
  DUMMY_PASSWORD_HASH,
  FAILED_TO_CREATE_USER_ERROR,
  INVALID_CREDENTIALS_ERROR,
  INVALID_REFRESH_TOKEN_ERROR,
  REFRESH_TOKEN_COOKIE_NAME,
  USER_NOT_FOUND_ERROR,
} from './auth.constants'
import {
  AccessTokenPayload,
  AuthFavoriteAwareUser,
  PreparedRequest,
  RefreshTokenPayload,
  UserWithoutPassword,
} from './auth.types'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly userService: UserService,
    private readonly favoritesService: FavoritesService,
    private readonly configService: ConfigService,
    private readonly authAccountService: AuthAccountService,
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

  logout(_refreshToken?: string) {
    return true
  }

  setRefreshTokenCookie(response: Response, refreshToken: string | null) {
    const defaultCookieOptions = {
      httpOnly: true,
      secure: !isDev(this.configService),
      domain: this.configService.get<string>('COOKIE_DOMAIN'),
      sameSite: isDev(this.configService) ? 'lax' : 'none',
    } as const

    response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...defaultCookieOptions,
      expires: refreshToken ? this.getRefreshTokenExpiresAt() : new Date(0),
    })
  }

  clearRefreshTokenCookie(response: Response) {
    this.setRefreshTokenCookie(response, null)
  }

  async getNewTokens(refreshToken: string, _request: PreparedRequest) {
    const verifiedRefreshToken = await this.verifyRefreshToken(refreshToken)

    if (!verifiedRefreshToken) {
      throw new BadRequestException(INVALID_REFRESH_TOKEN_ERROR)
    }

    const user = await this.userService.getById(verifiedRefreshToken.id)

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR)
    }

    const sessionTokens = this.generateSessionTokens(user)

    return {
      user,
      accessToken: sessionTokens.accessToken,
      refreshToken: sessionTokens.refreshToken,
    }
  }

  createSession(user: UserWithoutPassword, _request: PreparedRequest) {
    const sessionTokens = this.generateSessionTokens(user)

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
      await verify(DUMMY_PASSWORD_HASH, password)
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

  private generateSessionTokens(user: UserWithoutPassword) {
    const accessTokenPayload: AccessTokenPayload = {
      id: String(user._id),
      role: user.role,
    }

    const refreshTokenPayload: RefreshTokenPayload = {
      id: String(user._id),
    }

    const accessToken = this.jwt.sign(accessTokenPayload, {
      expiresIn: this.configService.getOrThrow<StringValue>(
        'JWT_ACCESS_TOKEN_EXPIRES_IN',
      ),
    })

    const refreshToken = this.jwt.sign(refreshTokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.getRefreshTokenExpiresIn(),
    })

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: this.getRefreshTokenExpiresAt(),
    }
  }

  private getRefreshTokenExpiresIn() {
    return this.configService.getOrThrow<StringValue>(
      'JWT_REFRESH_TOKEN_EXPIRES_IN',
    )
  }

  private getRefreshTokenExpiresAt() {
    return new Date(Date.now() + ms(this.getRefreshTokenExpiresIn()))
  }
}
