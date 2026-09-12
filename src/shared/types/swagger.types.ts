import { ApiProperty } from '@nestjs/swagger'
import { SWAGGER_REFRESH_TOKEN_AUTH_NAME } from '@shared/constants'

export type SwaggerPropertyOptions = Parameters<typeof ApiProperty>[0]

export type CookieToken = typeof SWAGGER_REFRESH_TOKEN_AUTH_NAME

export interface QueryPagePropertyDocsOptions {
  example: number
  description?: string
}

export interface QueryLimitPropertyDocsOptions {
  example: number
  maximum: number
  description?: string
}
