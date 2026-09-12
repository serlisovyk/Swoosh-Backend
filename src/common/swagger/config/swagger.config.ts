import { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppEnv } from '@shared/config'
import { isDev } from '@shared/utils'
import { SWAGGER_DOCS_PATH } from '@shared/constants'
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
} from '../constants'

export function setupSwagger(
  app: NestExpressApplication,
  configService: ConfigService<AppEnv, true>,
) {
  if (!configService.get('SWAGGER_ENABLED', { infer: true })) return

  if (!isDev(configService)) {
    const user = configService.getOrThrow('SWAGGER_USER', { infer: true })
    const password = configService.getOrThrow('SWAGGER_PASSWORD', {
      infer: true,
    })

    app.use(
      createSwaggerBasicAuthMiddleware(`/${SWAGGER_DOCS_PATH}`, user, password),
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

  SwaggerModule.setup(SWAGGER_DOCS_PATH, app, document, {
    customSiteTitle: SWAGGER_SITE_TITLE,
    explorer: true,
    swaggerOptions: { persistAuthorization: true },
  })
}
