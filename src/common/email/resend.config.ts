import { ConfigService } from '@nestjs/config'
import { AppEnv } from '@shared/config'

export function getResendConfig(configService: ConfigService<AppEnv, true>) {
  return {
    apiKey: configService.get('RESEND_API_KEY', { infer: true }),
  }
}
