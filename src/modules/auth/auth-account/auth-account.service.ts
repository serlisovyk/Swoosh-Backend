import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailService } from '@common/email/email.service'
import { UserService } from '../../user/user.service'
import { generateToken } from '../auth.utils'
import {
  INVALID_OR_EXPIRED_EMAIL_VERIFICATION_TOKEN_ERROR,
  INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR,
  RESET_PASSWORD_URL,
  RESET_PASSWORD_SUBJECT,
  VERIFY_EMAIL_SUBJECT,
  VERIFY_EMAIL_URL,
} from '../auth.constants'
import type { UserWithoutPassword } from '../auth.types'

@Injectable()
export class AuthAccountService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string) {
    const user = await this.userService.getByEmail(email.toLowerCase())

    if (!user) return true

    const resetToken = generateToken()

    await this.userService.setPasswordResetToken(String(user._id), resetToken)

    const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL')

    const resetUrl = `${clientUrl}${RESET_PASSWORD_URL}?token=${resetToken}`

    await this.emailService.sendResetPasswordEmail(
      user.email,
      resetUrl,
      RESET_PASSWORD_SUBJECT,
    )

    return true
  }

  async requestEmailVerification(user: UserWithoutPassword) {
    if (user.isEmailVerified) return true

    const verificationToken = generateToken()

    await this.userService.setEmailVerificationToken(
      String(user._id),
      verificationToken,
    )

    const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL')

    const verifyUrl = `${clientUrl}${VERIFY_EMAIL_URL}?token=${verificationToken}`
    
    const expiresHours = this.configService.getOrThrow<number>(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS',
    )

    await this.emailService.sendEmailVerificationEmail(
      user.email,
      verifyUrl,
      VERIFY_EMAIL_SUBJECT,
      expiresHours,
    )

    return true
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userService.findByPasswordResetToken(token)

    if (!user) {
      throw new BadRequestException(
        INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR,
      )
    }

    await this.userService.resetPassword(String(user._id), newPassword)

    return true
  }

  async verifyEmail(token: string) {
    const user = await this.userService.findByEmailVerificationToken(token)

    if (!user) {
      throw new BadRequestException(
        INVALID_OR_EXPIRED_EMAIL_VERIFICATION_TOKEN_ERROR,
      )
    }

    await this.userService.markEmailAsVerified(String(user._id))

    return true
  }
}
