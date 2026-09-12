import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
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
import { AppEnv, getValidationConfig, setupSwagger } from '@shared/config'
import { API_PREFIX } from '@shared/constants'
import { isDev } from '@shared/utils'
import { AppModule } from './app.module'

const logger = new Logger('Bootstrap')

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

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
    origin: configService.get('CORS_DOMAINS', { infer: true }),
    credentials: true,
  })

  setupSwagger(app, configService)

  const port = configService.get('PORT', { infer: true })

  await app.listen(port)
}

bootstrap().catch((error: unknown) => {
  logger.error('Application failed to start', error)
  process.exit(1)
})
