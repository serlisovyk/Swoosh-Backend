import { ConfigService } from '@nestjs/config'
import { ThrottlerOptions } from '@nestjs/throttler'
import { isDev } from '@shared/utils'

export function getThrottlerConfig(
  configService: ConfigService,
): ThrottlerOptions[] {
  return [
    {
      ttl: configService.getOrThrow<number>('THROTTLE_TTL'),
      limit: configService.getOrThrow<number>('THROTTLE_LIMIT'),
      skipIf: () => isDev(configService),
    },
  ]
}
