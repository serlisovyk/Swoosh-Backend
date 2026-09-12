import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailService } from '@common/email/email.service'
import { generateToken } from '@shared/utils'
import { UserService } from '../../user/user.service'
import {
  INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR,
  RESET_PASSWORD_URL,
} from './password-reset.constants'

@Injectable()
export class PasswordResetService {
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

    try {
      await this.emailService.sendResetPasswordEmail(user.email, resetUrl)
    } catch {
      // A send failure must not change this response — anti-enumeration.
    }

    return true
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userService.consumePasswordResetToken(token)

    if (!user) {
      throw new BadRequestException(
        INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR,
      )
    }

    await this.userService.resetPassword(String(user._id), newPassword)

    return true
  }

}
