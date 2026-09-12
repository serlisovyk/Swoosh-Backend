import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ConfigService } from '@nestjs/config'
import { TurnstileCaptcha as Captcha } from 'nest-cloudflare-turnstile'
import type { Response } from 'express'
import { AppEnv } from '@shared/config'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { AuthService } from './auth.service'
import {
  buildRefreshTokenCookieOptions,
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from './auth.cookies'
import {
  AuthLoginDocs,
  AuthLogoutDocs,
  AuthNewTokensDocs,
  AuthRegisterDocs,
  AuthTagDocs,
} from './auth.swagger'
import {
  AUTH_LOGIN_THROTTLE,
  AUTH_REGISTER_THROTTLE,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_MISSING_ERROR,
} from './auth.constants'
import type { PreparedRequest, RefreshTokenCookieOptions } from './auth.types'

@AuthTagDocs()
@Controller('auth')
export class AuthController {
  private readonly refreshTokenCookieOptions: RefreshTokenCookieOptions

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService<AppEnv, true>,
  ) {
    this.refreshTokenCookieOptions =
      buildRefreshTokenCookieOptions(configService)
  }

  @AuthRegisterDocs()
  @Throttle(AUTH_REGISTER_THROTTLE)
  @Captcha()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, refreshTokenExpiresAt, ...response } =
      await this.authService.register(dto)

    setRefreshTokenCookie(
      res,
      refreshToken,
      refreshTokenExpiresAt,
      this.refreshTokenCookieOptions,
    )

    return response
  }

  @AuthLoginDocs()
  @Throttle(AUTH_LOGIN_THROTTLE)
  @Captcha()
  @HttpCode(HttpStatus.CREATED)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, refreshTokenExpiresAt, ...response } =
      await this.authService.login(dto)

    setRefreshTokenCookie(
      res,
      refreshToken,
      refreshTokenExpiresAt,
      this.refreshTokenCookieOptions,
    )

    return response
  }

  @AuthNewTokensDocs()
  @Post('new-tokens')
  async newTokens(
    @Req() req: PreparedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const initialRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]

    clearRefreshTokenCookie(res, this.refreshTokenCookieOptions)

    if (!initialRefreshToken) {
      throw new BadRequestException(REFRESH_TOKEN_MISSING_ERROR)
    }

    const { refreshToken, refreshTokenExpiresAt, ...response } =
      await this.authService.getNewTokens(initialRefreshToken)

    setRefreshTokenCookie(
      res,
      refreshToken,
      refreshTokenExpiresAt,
      this.refreshTokenCookieOptions,
    )

    return response
  }

  @AuthLogoutDocs()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    clearRefreshTokenCookie(res, this.refreshTokenCookieOptions)

    return true
  }
}
