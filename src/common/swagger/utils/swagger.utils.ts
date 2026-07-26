import {
  ApiProperty,
  ApiPropertyOptional,
  DocumentBuilder,
} from '@nestjs/swagger'
import { SWAGGER_ACCESS_TOKEN_AUTH_NAME } from '../constants'
import { CookieToken, SwaggerPropertyOptions } from '../types'

export function createPropertyDocsDecorator(options: SwaggerPropertyOptions) {
  return function ProductsPropertyDocsDecorator() {
    return ApiProperty(options)
  }
}

export function createOptionalPropertyDocsDecorator(
  options: SwaggerPropertyOptions,
) {
  return function ProductsOptionalPropertyDocsDecorator() {
    return ApiPropertyOptional(options)
  }
}

export function createSwaggerOperationId(
  controllerKey: string,
  methodKey: string,
) {
  const normalizedControllerKey = controllerKey.replace(/Controller$/, '')

  const resourceKey = normalizedControllerKey
    ? normalizedControllerKey.charAt(0).toLowerCase() +
      normalizedControllerKey.slice(1)
    : 'root'

  return `${resourceKey}_${methodKey}`
}

export function addSwaggerCookieAuth(
  config: DocumentBuilder,
  token: CookieToken,
) {
  const isAccessToken = token === SWAGGER_ACCESS_TOKEN_AUTH_NAME

  config.addCookieAuth(
    token,
    {
      type: 'apiKey',
      description: `${isAccessToken ? 'Access' : 'Refresh'} token stored in an HttpOnly cookie.`,
    },
    token,
  )
}
