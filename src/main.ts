import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { setupSwagger } from '@common/swagger'
import { setupValidation } from '@shared/config'
import { parseCorsDomainsConfigValue } from '@shared/utils'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix('api/v1')

  const configService = app.get(ConfigService)

  setupValidation(app)

  setupSwagger(app)

  app.use(cookieParser())

  app.use(helmet())

  app.enableCors({
    origin: parseCorsDomainsConfigValue(
      configService.get<string>('CORS_DOMAINS'),
    ),
    credentials: true,
  })

  app.disable('x-powered-by')

  const PORT = configService.getOrThrow<number>('PORT')

  await app.listen(PORT)
}

void bootstrap()
