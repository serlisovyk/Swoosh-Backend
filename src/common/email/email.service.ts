import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ResendService } from 'nestjs-resend'
import { render } from '@react-email/render'
import { ResetPasswordEmail } from './templates/reset-password.template'

@Injectable()
export class EmailService {
  constructor(
    private readonly resend: ResendService,
    private readonly configService: ConfigService,
  ) {}

  async sendResetPasswordEmail(to: string, url: string, subject: string) {
    const html = await render(
      ResetPasswordEmail({
        url,
        appName: this.getAppName(),
      }),
    )

    return this.send(to, subject, html)
  }

  private async send(to: string, subject: string, html: string) {
    return this.resend.send({
      from: this.emailSender(),
      to,
      subject,
      html,
    })
  }

  private getAppName() {
    return this.configService.getOrThrow<string>('APP_NAME')
  }

  private emailSender() {
    return this.configService.getOrThrow<string>('EMAIL_SENDER')
  }
}
