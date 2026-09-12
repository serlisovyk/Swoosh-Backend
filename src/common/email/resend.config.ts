import { ConfigService } from '@nestjs/config'
import { AppEnv } from '@shared/config'
import { getEnv } from '@shared/utils'

export function getResendConfig(configService: ConfigService<AppEnv, true>) {
  return {
    apiKey: getEnv(configService, 'email.RESEND_API_KEY'),
  }
}
