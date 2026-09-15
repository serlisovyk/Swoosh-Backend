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
import { getEnv } from '@shared/utils'
import { FavoritesService } from '@modules/favorites'
import { UsersService } from '../users/users.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { INVALID_CREDENTIALS_ERROR } from './auth.constants'
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
    private readonly usersService: UsersService,
    private readonly favoritesService: FavoritesService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async register(dto: RegisterDto) {
    const createdUser = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phone: dto.phone,
    })

    if (!createdUser) {
      throw new InternalServerErrorException('Не удалось создать пользователя')
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
      throw new BadRequestException('Неверный refresh токен')
    }

    const user = await this.usersService.getById(verifiedRefreshToken.id)

    if (!user) {
      throw new NotFoundException('Пользователь с таким email не найден')
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
        secret: getEnv(this.configService, 'jwt.JWT_REFRESH_SECRET'),
      })
      .catch(() => null)
  }

  private async validateUser(data: LoginDto) {
    const { email, password } = data

    const user = await this.usersService.getByEmailWithPassword(email)

    if (!user) {
      const dummyPasswordHash = getEnv(
        this.configService,
        'jwt.AUTH_DUMMY_PASSWORD_HASH',
      )

      await verify(dummyPasswordHash, password)
      throw new UnauthorizedException(INVALID_CREDENTIALS_ERROR)
    }

    const isPasswordValid = await verify(user.password, password)

    if (!isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_ERROR)
    }

    const { password: _password, ...safeUser } = user

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
      expiresIn: getEnv(
        this.configService,
        'jwt.JWT_ACCESS_TOKEN_EXPIRES_IN',
      ) as StringValue,
    })

    const refreshToken = this.jwt.sign(refreshTokenPayload, {
      secret: getEnv(this.configService, 'jwt.JWT_REFRESH_SECRET'),
      expiresIn: this.getRefreshTokenExpiresIn(),
    })

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: this.getRefreshTokenExpiresAt(),
    }
  }

  private getRefreshTokenExpiresIn(): StringValue {
    return getEnv(
      this.configService,
      'jwt.JWT_REFRESH_TOKEN_EXPIRES_IN',
    ) as StringValue
  }

  private getRefreshTokenExpiresAt() {
    return new Date(Date.now() + ms(this.getRefreshTokenExpiresIn()))
  }
}
