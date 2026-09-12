import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailService } from '@common/email/email.service'
import { AppEnv } from '@shared/config'
import { generateToken } from '@shared/utils'
import { UsersService } from '../../users/users.service'
import {
  INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR,
  RESET_PASSWORD_URL,
} from './password-reset.constants'

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly configService: ConfigService<AppEnv, true>,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string) {
    const user = await this.usersService.getByEmail(email.toLowerCase())

    if (!user) return true

    const resetToken = generateToken()

    await this.usersService.setPasswordResetToken(String(user._id), resetToken)

    const clientUrl = this.configService.get('CLIENT_URL', { infer: true })

    const resetUrl = `${clientUrl}${RESET_PASSWORD_URL}?token=${resetToken}`

    try {
      await this.emailService.sendResetPasswordEmail(user.email, resetUrl)
    } catch {
      // A send failure must not change this response — anti-enumeration.
    }

    return true
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.consumePasswordResetToken(token)

    if (!user) {
      throw new BadRequestException(
        INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR,
      )
    }

    await this.usersService.resetPassword(String(user._id), newPassword)

    return true
  }
}
