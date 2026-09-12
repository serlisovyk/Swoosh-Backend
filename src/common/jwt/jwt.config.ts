import { ConfigService } from '@nestjs/config'
import { AppEnv } from '@shared/config'
import { getEnv } from '@shared/utils'

export function getJwtConfig(configService: ConfigService<AppEnv, true>) {
  return {
    secret: getEnv(configService, 'jwt.JWT_SECRET'),
  }
}
