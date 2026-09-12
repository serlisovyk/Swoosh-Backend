import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { getEnv, getEnvOrThrow, isDev } from '@shared/utils'
import {
  SWAGGER_DOCS_PATH,
  SWAGGER_ACCESS_TOKEN_AUTH_NAME,
  SWAGGER_REFRESH_TOKEN_AUTH_NAME,
  SWAGGER_SITE_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
} from '@shared/constants'
import {
  addSwaggerCookieAuth,
  createSwaggerBasicAuthMiddleware,
  createSwaggerOperationId,
} from '@shared/swagger'
import { AppEnv } from './env.config'

function buildSwaggerDocument(app: NestExpressApplication) {
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

  return SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: createSwaggerOperationId,
  })
}

export function setupSwagger(
  app: NestExpressApplication,
  configService: ConfigService<AppEnv, true>,
) {
  if (!getEnv(configService, 'swagger.SWAGGER_ENABLED')) return

  if (!isDev(configService)) {
    const user = getEnvOrThrow(configService, 'swagger.SWAGGER_USER')
    const password = getEnvOrThrow(configService, 'swagger.SWAGGER_PASSWORD')

    app.use(
      createSwaggerBasicAuthMiddleware(`/${SWAGGER_DOCS_PATH}`, user, password),
    )
  }

  const document = buildSwaggerDocument(app)

  SwaggerModule.setup(SWAGGER_DOCS_PATH, app, document, {
    customSiteTitle: SWAGGER_SITE_TITLE,
    explorer: true,
    swaggerOptions: { persistAuthorization: true },
  })
}
