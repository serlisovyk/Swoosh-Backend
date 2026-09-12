import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ResendService } from 'nestjs-resend'
import { render } from '@react-email/render'
import { AppEnv } from '@shared/config'
import { getEnv } from '@shared/utils'
import { ResetPasswordEmail } from './templates/reset-password'
import {
  EMAIL_SEND_FAILED_ERROR,
  RESET_PASSWORD_EMAIL_SUBJECT,
} from './email.constants'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(
    private readonly resend: ResendService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async sendResetPasswordEmail(to: string, url: string) {
    const html = await render(
      ResetPasswordEmail({
        url,
        appName: this.getAppName(),
      }),
    )

    await this.send(to, RESET_PASSWORD_EMAIL_SUBJECT, html)
  }

  private async send(to: string, subject: string, html: string) {
    try {
      const { error } = await this.resend.send({
        from: this.emailSender(),
        to,
        subject,
        html,
      })

      if (error) {
        this.logger.error(
          `Email "${subject}" to ${to} failed: ${error.name} - ${error.message}`,
        )

        throw new InternalServerErrorException(EMAIL_SEND_FAILED_ERROR)
      }
    } catch (caughtError) {
      if (caughtError instanceof InternalServerErrorException) throw caughtError

      this.logger.error(
        `Email "${subject}" to ${to} failed`,
        caughtError instanceof Error ? caughtError.stack : String(caughtError),
      )

      throw new InternalServerErrorException(EMAIL_SEND_FAILED_ERROR)
    }
  }

  private getAppName() {
    return getEnv(this.configService, 'app.APP_NAME')
  }

  private emailSender() {
    return getEnv(this.configService, 'email.EMAIL_SENDER')
  }
}
