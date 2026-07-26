import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { addSwaggerCookieAuth, createSwaggerOperationId } from '../utils'
import {
  SWAGGER_ACCESS_TOKEN_AUTH_NAME,
  SWAGGER_REFRESH_TOKEN_AUTH_NAME,
  SWAGGER_SITE_TITLE,
  SWAGGER_DESCRIPTION,
  SWAGGER_VERSION,
  SWAGGER_PATH,
} from '../constants'

export function setupSwagger(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_SITE_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)

  addSwaggerCookieAuth(config, SWAGGER_ACCESS_TOKEN_AUTH_NAME)
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
  })
}
