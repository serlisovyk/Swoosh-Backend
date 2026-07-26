import { ConfigService } from '@nestjs/config'

export function getMongoString(config: ConfigService): string {
  const login = config.getOrThrow<string>('MONGO_LOGIN')
  const password = config.getOrThrow<string>('MONGO_PASSWORD')

  const protocol = config.getOrThrow<string>('MONGO_PROTOCOL')
  const host = config.getOrThrow<string>('MONGO_HOST')
  const db = config.getOrThrow<string>('MONGO_DB')

  const options = config.getOrThrow<string>('MONGO_OPTIONS')

  const credentials = `${encodeURIComponent(login)}:${encodeURIComponent(password)}@`

  return `${protocol}://${credentials}${host}/${db}?${options}`
}
