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
import { setupSwagger } from '@common/swagger'
import { AppEnv, setupValidation } from '@shared/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix('api/v1')

  const configService = app.get<ConfigService<AppEnv, true>>(ConfigService)

  setupValidation(
    app,
    (errors) => new ValidationFailedException(flattenValidationErrors(errors)),
  )

  app.useGlobalFilters(new AllExceptionsFilter())

  app.use(cookieParser())

  app.use(helmet())

  app.enableCors({
    origin: configService.get('CORS_DOMAINS', { infer: true }),
    credentials: true,
  })

  app.disable('x-powered-by')

  setupSwagger(app, configService)

  const port = configService.get('PORT', { infer: true })

  await app.listen(port)
}

void bootstrap()
