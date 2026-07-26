import { ConfigService } from '@nestjs/config'
import { NODE_ENV } from '@shared/constants'

export function isDev(configService: ConfigService) {
  return configService.get<string>('NODE_ENV') === NODE_ENV.DEVELOPMENT
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
