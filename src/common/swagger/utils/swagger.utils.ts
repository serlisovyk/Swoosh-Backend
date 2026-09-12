import {
  ApiProperty,
  ApiPropertyOptional,
  DocumentBuilder,
} from '@nestjs/swagger'
import {
  CookieToken,
  QueryLimitPropertyDocsOptions,
  QueryPagePropertyDocsOptions,
  SwaggerPropertyOptions,
} from '../types'

export function createPropertyDocsDecorator(options: SwaggerPropertyOptions) {
  return function PropertyDocsDecorator() {
    return ApiProperty(options)
  }
}

export function createOptionalPropertyDocsDecorator(
  options: SwaggerPropertyOptions,
) {
  return function OptionalPropertyDocsDecorator() {
    return ApiPropertyOptional(options)
  }
}

export function QueryPagePropertyDocs(options: QueryPagePropertyDocsOptions) {
  return createOptionalPropertyDocsDecorator({
    description: options.description ?? 'Results page number.',
    example: options.example,
    minimum: 1,
  })
}

export function QueryLimitPropertyDocs(options: QueryLimitPropertyDocsOptions) {
  return createOptionalPropertyDocsDecorator({
    description:
      options.description ?? 'Maximum number of items returned per page.',
    example: options.example,
    minimum: 1,
    maximum: options.maximum,
  })
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
  config.addCookieAuth(
    token,
    {
      type: 'apiKey',
      description: 'Refresh token stored in an HttpOnly cookie.',
    },
    token,
  )
}
