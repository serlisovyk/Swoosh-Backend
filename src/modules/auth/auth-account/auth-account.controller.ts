import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { TurnstileCaptcha as Captcha } from 'nest-cloudflare-turnstile'
import { RequestPasswordResetDto } from './dto/request-password-reset.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { AuthAccountService } from './auth-account.service'
import {
  AuthRequestPasswordResetDocs,
  AuthResetPasswordDocs,
  AuthTagDocs,
} from '../auth.swagger'
import {
  AUTH_PASSWORD_RESET_REQUEST_THROTTLE,
  AUTH_PASSWORD_RESET_THROTTLE,
} from '../auth.constants'

@AuthTagDocs()
@Controller('auth')
export class AuthAccountController {
  constructor(private readonly authAccountService: AuthAccountService) {}

  @AuthRequestPasswordResetDocs()
  @Throttle(AUTH_PASSWORD_RESET_REQUEST_THROTTLE)
  @Captcha()
  @HttpCode(HttpStatus.OK)
  @Post('request-password-reset')
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authAccountService.requestPasswordReset(dto.email)
  }

  @AuthResetPasswordDocs()
  @Throttle(AUTH_PASSWORD_RESET_THROTTLE)
  @Captcha()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authAccountService.resetPassword(dto.token, dto.newPassword)
  }
}
