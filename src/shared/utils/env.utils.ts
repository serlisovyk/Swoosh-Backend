import { ConfigService } from '@nestjs/config'
import { NODE_ENV } from '@shared/constants'
import type { AppEnv } from '@shared/config'

export function isDev(configService: ConfigService<AppEnv, true>) {
  return configService.get('NODE_ENV', { infer: true }) === NODE_ENV.DEVELOPMENT
}

export function isProd(configService: ConfigService<AppEnv, true>) {
  return configService.get('NODE_ENV', { infer: true }) === NODE_ENV.PRODUCTION
}

export function parseCorsDomainsConfigValue(
  value: string | undefined,
): string[] | undefined {
  if (!value) return undefined

  const values = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return values.length ? values : undefined
}
