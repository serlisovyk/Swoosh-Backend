import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import ms, { StringValue } from 'ms'
import { AppEnv } from '@shared/config'
import { noop } from '@shared/utils'
import { FavoritesService } from '@modules/favorites'
import { UserService } from '../user/user.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import {
  FAILED_TO_CREATE_USER_ERROR,
  INVALID_CREDENTIALS_ERROR,
  INVALID_REFRESH_TOKEN_ERROR,
  USER_NOT_FOUND_ERROR,
} from './auth.constants'
import {
  AccessTokenPayload,
  AuthFavoriteAwareUser,
  RefreshTokenPayload,
  UserWithoutPassword,
} from './auth.types'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly userService: UserService,
    private readonly favoritesService: FavoritesService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async register(dto: RegisterDto) {
    const createdUser = await this.userService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phone: dto.phone,
    })

    if (!createdUser) {
      throw new InternalServerErrorException(FAILED_TO_CREATE_USER_ERROR)
    }

    const user = await this.mergeAuthFavorites(
      createdUser,
      dto.favoriteProductIds,
    )

    return this.createSession(user)
  }

  async login(dto: LoginDto) {
    const validatedUser = await this.validateUser(dto)

    const user = await this.mergeAuthFavorites(
      validatedUser,
      dto.favoriteProductIds,
    )

    return this.createSession(user)
  }

  async getNewTokens(refreshToken: string) {
    const verifiedRefreshToken = await this.verifyRefreshToken(refreshToken)

    if (!verifiedRefreshToken) {
      throw new BadRequestException(INVALID_REFRESH_TOKEN_ERROR)
    }

    const user = await this.userService.getById(verifiedRefreshToken.id)

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR)
    }

    return this.createSession(user)
  }

  createSession(user: UserWithoutPassword) {
    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      this.generateSessionTokens(user)

    return { user, accessToken, refreshToken, refreshTokenExpiresAt }
  }

  private async verifyRefreshToken(refreshToken?: string | null) {
    if (!refreshToken) return null

    return this.jwt
      .verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      })
      .catch(() => null)
  }

  private async validateUser(data: LoginDto) {
    const { email, password } = data

    const user = await this.userService.getByEmailWithPassword(email)

    if (!user) {
      const dummyPasswordHash = this.configService.get(
        'AUTH_DUMMY_PASSWORD_HASH',
        { infer: true },
      )

      await verify(dummyPasswordHash, password)
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
    }

    const refreshTokenPayload: RefreshTokenPayload = {
      id: String(user._id),
    }

    const accessToken = this.jwt.sign(accessTokenPayload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', {
        infer: true,
      }),
    })

    const refreshToken = this.jwt.sign(refreshTokenPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      expiresIn: this.getRefreshTokenExpiresIn(),
    })

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: this.getRefreshTokenExpiresAt(),
    }
  }

  // ms's StringValue is a branded template-literal type zod can't express as
  // a runtime-checked shape (schema only guarantees a non-empty string) — an
  // explicit return type here lets it flow in via context, no `as` needed.
  private getRefreshTokenExpiresIn(): StringValue {
    return this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN', {
      infer: true,
    })
  }

  private getRefreshTokenExpiresAt() {
    return new Date(Date.now() + ms(this.getRefreshTokenExpiresIn()))
  }
}
