import { ConfigService } from '@nestjs/config'
import { AppEnv } from '@shared/config'

export function getJwtConfig(configService: ConfigService<AppEnv, true>) {
  return {
    secret: configService.get('JWT_SECRET', { infer: true }),
  }
}
