import { ConfigService } from '@nestjs/config'
import { MongooseModuleOptions } from '@nestjs/mongoose'
import { AppEnv } from '@shared/config'
import { isDev } from '@shared/utils'

export function getMongoConfig(
  config: ConfigService<AppEnv, true>,
): MongooseModuleOptions {
  return {
    uri: config.get('MONGO_URI', { infer: true }),
    autoIndex: isDev(config),
    retryAttempts: 3,
  }
}
