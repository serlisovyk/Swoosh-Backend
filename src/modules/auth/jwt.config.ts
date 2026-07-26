import { ConfigService } from '@nestjs/config'

export function getJwtConfig(configService: ConfigService) {
  return {
    secret: configService.getOrThrow<string>('JWT_SECRET'),
  }
}
