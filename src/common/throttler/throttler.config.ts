import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ThrottlerOptions } from '@nestjs/throttler'
import { AppEnv } from '@shared/config'
import { getEnv, isDev } from '@shared/utils'

const logger = new Logger('ThrottlerConfig')

export function getThrottlerConfig(
  configService: ConfigService<AppEnv, true>,
): ThrottlerOptions[] {
  if (isDev(configService)) {
    logger.warn('Throttling is disabled (NODE_ENV=development)')
  }

  return [
    {
      ttl: getEnv(configService, 'throttler.THROTTLE_TTL'),
      limit: getEnv(configService, 'throttler.THROTTLE_LIMIT'),
      skipIf: () => isDev(configService),
    },
  ]
}
