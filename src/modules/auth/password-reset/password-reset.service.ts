import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailService } from '@common/email'
import { AppEnv } from '@shared/config'
import { generateToken, getEnv } from '@shared/utils'
import { UsersService } from '../../users/users.service'
import { RESET_PASSWORD_URL } from './password-reset.constants'

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name)

  constructor(
    private readonly configService: ConfigService<AppEnv, true>,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string) {
    const user = await this.usersService.getByEmail(email.toLowerCase())

    if (!user) return true

    const resetToken = generateToken()
    const clientUrl = getEnv(this.configService, 'app.CLIENT_URL')
    const resetUrl = `${clientUrl}${RESET_PASSWORD_URL}?token=${resetToken}`

    // Neither call is awaited: response timing must not depend on whether
    // the account exists, and the dominant cost here (a Resend network
    // call) is too variable for a same-cost dummy op — see MY-80.
    void this.usersService
      .setPasswordResetToken(String(user._id), resetToken)
      .catch((error: unknown) => {
        this.logger.error(
          `Failed to persist password reset token for user ${String(user._id)}`,
          error instanceof Error ? error.stack : String(error),
        )
      })

    void this.emailService
      .sendResetPasswordEmail(user.email, resetUrl)
      .catch(() => {
        // Already logged inside EmailService; must not change this response.
      })

    return true
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.consumePasswordResetToken(token)

    if (!user) {
      throw new BadRequestException(
        'Недействительная или просроченная ссылка для сброса пароля',
      )
    }

    await this.usersService.resetPassword(String(user._id), newPassword)

    return true
  }
}
