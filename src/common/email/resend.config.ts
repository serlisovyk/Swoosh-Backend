import { ConfigService } from '@nestjs/config'

export function getResendConfig(configService: ConfigService) {
  return {
    apiKey: configService.getOrThrow<string>('RESEND_API_KEY'),
  }
}
