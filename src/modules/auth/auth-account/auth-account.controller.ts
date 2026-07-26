import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { TurnstileCaptcha as Captcha } from 'nest-cloudflare-turnstile'
import { Auth } from '../decorators/auth.decorator'
import { CurrentUser } from '../decorators/user.decorator'
import { RequestPasswordResetDto } from './dto/request-password-reset.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { AuthAccountService } from './auth-account.service'
import {
  AuthRequestEmailVerificationDocs,
  AuthRequestPasswordResetDocs,
  AuthResetPasswordDocs,
  AuthTagDocs,
  AuthVerifyEmailDocs,
} from '../auth.swagger'
import {
  AUTH_EMAIL_VERIFICATION_REQUEST_THROTTLE,
  AUTH_EMAIL_VERIFICATION_THROTTLE,
  AUTH_PASSWORD_RESET_REQUEST_THROTTLE,
  AUTH_PASSWORD_RESET_THROTTLE,
} from '../auth.constants'
import type { UserWithoutPassword } from '../auth.types'

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

  @AuthRequestEmailVerificationDocs()
  @Auth()
  @Throttle(AUTH_EMAIL_VERIFICATION_REQUEST_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('request-email-verification')
  requestEmailVerification(@CurrentUser() user: UserWithoutPassword) {
    return this.authAccountService.requestEmailVerification(user)
  }

  @AuthVerifyEmailDocs()
  @Throttle(AUTH_EMAIL_VERIFICATION_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authAccountService.verifyEmail(dto.token)
  }
}
