import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { setupApp } from '@shared/config'
import { getEnv } from '@shared/utils'
import { AppModule } from './app.module'

const logger = new Logger('Bootstrap')

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const configService = setupApp(app)

  const port = getEnv(configService, 'app.PORT')

  await app.listen(port)
}

bootstrap().catch((error: unknown) => {
  logger.error('Application failed to start', error)
  process.exit(1)
})
