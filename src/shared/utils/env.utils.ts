import { ConfigService, type Path, type PathValue } from '@nestjs/config'
import { NODE_ENV } from '@shared/constants'
import type { AppEnv } from '@shared/config'

export function getEnv<P extends Path<AppEnv>>(
  configService: ConfigService<AppEnv, true>,
  key: P,
): PathValue<AppEnv, P> {
  return configService.get(key, { infer: true })
}

export function getEnvOrThrow<P extends Path<AppEnv>>(
  configService: ConfigService<AppEnv, true>,
  key: P,
): Exclude<PathValue<AppEnv, P>, undefined> {
  return configService.getOrThrow(key, { infer: true })
}

export function isDev(configService: ConfigService<AppEnv, true>) {
  return getEnv(configService, 'app.NODE_ENV') === NODE_ENV.DEVELOPMENT
}

export function isProd(configService: ConfigService<AppEnv, true>) {
  return getEnv(configService, 'app.NODE_ENV') === NODE_ENV.PRODUCTION
}

export function parseCorsDomainsConfigValue(
  value: string | undefined,
): string[] | undefined {
  if (!value) return

  const values = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (!values.length) return

  return values
}
