import { ConfigService } from '@nestjs/config'
import { MongooseModuleOptions } from '@nestjs/mongoose'
import { AppEnv } from '@shared/config'
import { getEnv, isDev } from '@shared/utils'

export function getMongoConfig(
  config: ConfigService<AppEnv, true>,
): MongooseModuleOptions {
  return {
    uri: getEnv(config, 'mongo.MONGO_URI'),
    autoIndex: isDev(config),
    retryAttempts: 3,
  }
}
