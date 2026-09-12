import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { isDev } from '@shared/utils'
import {
  addSwaggerCookieAuth,
  createSwaggerBasicAuthMiddleware,
  createSwaggerOperationId,
} from '../utils'
import {
  SWAGGER_ACCESS_TOKEN_AUTH_NAME,
  SWAGGER_REFRESH_TOKEN_AUTH_NAME,
  SWAGGER_SITE_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
  SWAGGER_PATH,
} from '../constants'

export function setupSwagger(
  app: NestExpressApplication,
  configService: ConfigService,
) {
  if (configService.get<string>('SWAGGER_ENABLED') === 'false') return

  if (!isDev(configService)) {
    const user = configService.getOrThrow<string>('SWAGGER_USER')
    const password = configService.getOrThrow<string>('SWAGGER_PASSWORD')

    app.use(
      createSwaggerBasicAuthMiddleware(`/${SWAGGER_PATH}`, user, password),
    )
  }

  const config = new DocumentBuilder()
    .setTitle(SWAGGER_SITE_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)

  config.addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Access token passed in the Authorization header.',
    },
    SWAGGER_ACCESS_TOKEN_AUTH_NAME,
  )
  addSwaggerCookieAuth(config, SWAGGER_REFRESH_TOKEN_AUTH_NAME)

  const swaggerConfig = config
    .addSecurityRequirements(SWAGGER_ACCESS_TOKEN_AUTH_NAME)
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: createSwaggerOperationId,
  })

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: SWAGGER_SITE_TITLE,
    explorer: true,
    swaggerOptions: { persistAuthorization: true },
  })
}
