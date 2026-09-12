import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { TurnstileCaptcha as Captcha } from 'nest-cloudflare-turnstile'
import { RequestPasswordResetDto } from './dto/request-password-reset.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { PasswordResetService } from './password-reset.service'
import { AuthRequestPasswordResetDocs, AuthResetPasswordDocs } from './password-reset.swagger'
import {
  AUTH_PASSWORD_RESET_REQUEST_THROTTLE,
  AUTH_PASSWORD_RESET_THROTTLE,
} from './password-reset.constants'
import { AuthTagDocs } from '../auth.swagger'

// Same `/auth` prefix and Swagger tag as AuthController — a `/auth/password-reset`
// subpath was considered and rejected, since it would change these two public
// routes. Keeping them flat under /auth was the deliberate choice (MY-54).
@AuthTagDocs()
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @AuthRequestPasswordResetDocs()
  @Throttle(AUTH_PASSWORD_RESET_REQUEST_THROTTLE)
  @Captcha()
  @HttpCode(HttpStatus.OK)
  @Post('request-password-reset')
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.passwordResetService.requestPasswordReset(dto.email)
  }

  @AuthResetPasswordDocs()
  @Throttle(AUTH_PASSWORD_RESET_THROTTLE)
  @Captcha()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto.token, dto.newPassword)
  }
}
