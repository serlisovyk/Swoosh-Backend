import { ConfigService } from '@nestjs/config'
import { MongooseModuleOptions } from '@nestjs/mongoose'
import { isDev } from '@shared/utils'

export function getMongoConfig(config: ConfigService): MongooseModuleOptions {
  return {
    uri: config.getOrThrow<string>('MONGO_URI'),
    autoIndex: isDev(config),
    retryAttempts: 3,
  }
}
