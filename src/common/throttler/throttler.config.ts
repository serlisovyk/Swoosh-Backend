import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ThrottlerOptions } from '@nestjs/throttler'
import { AppEnv } from '@shared/config'
import { isDev } from '@shared/utils'

const logger = new Logger('ThrottlerConfig')

export function getThrottlerConfig(
  configService: ConfigService<AppEnv, true>,
): ThrottlerOptions[] {
  if (isDev(configService)) {
    logger.warn('Throttling is disabled (NODE_ENV=development)')
  }

  return [
    {
      ttl: configService.get('THROTTLE_TTL', { infer: true }),
      limit: configService.get('THROTTLE_LIMIT', { infer: true }),
      skipIf: () => isDev(configService),
    },
  ]
}
