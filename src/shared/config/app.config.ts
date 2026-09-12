import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import {
  AllExceptionsFilter,
  ValidationFailedException,
  flattenValidationErrors,
} from '@common/errors'
import {
  PRODUCTION_LOG_LEVELS,
  requestLoggingMiddleware,
} from '@common/logging'
import { API_PREFIX } from '@shared/constants'
import { getEnv, isDev } from '@shared/utils'
import type { AppEnv } from './env.config'
import { getValidationConfig } from './validation.config'
import { setupSwagger } from './swagger.config'

export function setupApp(
  app: NestExpressApplication,
): ConfigService<AppEnv, true> {
  app.enableShutdownHooks()

  app.use(requestLoggingMiddleware)

  app.setGlobalPrefix(API_PREFIX)

  const configService = app.get<ConfigService<AppEnv, true>>(ConfigService)

  if (!isDev(configService)) {
    Logger.overrideLogger(PRODUCTION_LOG_LEVELS)
  }

  app.useGlobalPipes(
    new ValidationPipe(
      getValidationConfig(
        (errors) =>
          new ValidationFailedException(flattenValidationErrors(errors)),
      ),
    ),
  )

  app.useGlobalFilters(new AllExceptionsFilter())

  app.use(cookieParser())

  app.use(helmet())

  app.enableCors({
    origin: getEnv(configService, 'cors.CORS_DOMAINS'),
    credentials: true,
  })

  setupSwagger(app, configService)

  return configService
}
