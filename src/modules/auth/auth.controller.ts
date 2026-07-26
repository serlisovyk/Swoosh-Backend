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
import { TurnstileCaptcha as Captcha } from 'nest-cloudflare-turnstile'
import type { Response } from 'express'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { AuthService } from './auth.service'
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
import type { PreparedRequest } from './auth.types'

@AuthTagDocs()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AuthRegisterDocs()
  @Throttle(AUTH_REGISTER_THROTTLE)
  @Captcha()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Req() req: PreparedRequest,
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, ...response } =
      await this.authService.register(dto, req)

    this.authService.setAuthTokens(res, accessToken, refreshToken)

    return response
  }

  @AuthLoginDocs()
  @Throttle(AUTH_LOGIN_THROTTLE)
  @Captcha()
  @HttpCode(HttpStatus.CREATED)
  @Post('login')
  async login(
    @Req() req: PreparedRequest,
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken, ...response } =
      await this.authService.login(dto, req)

    this.authService.setAuthTokens(res, accessToken, refreshToken)

    return response
  }

  @AuthNewTokensDocs()
  @Post('new-tokens')
  async newTokens(
    @Req() req: PreparedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const initialRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]

    this.authService.setAuthTokens(res, null, null)

    if (!initialRefreshToken) {
      throw new BadRequestException(REFRESH_TOKEN_MISSING_ERROR)
    }

    const { refreshToken, accessToken, ...response } =
      await this.authService.getNewTokens(initialRefreshToken, req)

    this.authService.setAuthTokens(res, accessToken, refreshToken)

    return response
  }

  @AuthLogoutDocs()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Req() req: PreparedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE_NAME])

    this.authService.setAuthTokens(res, null, null)

    return true
  }
}
