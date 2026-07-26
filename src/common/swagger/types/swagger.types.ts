import { ApiProperty } from '@nestjs/swagger'
import {
  SWAGGER_ACCESS_TOKEN_AUTH_NAME,
  SWAGGER_REFRESH_TOKEN_AUTH_NAME,
} from '../constants'

export type SwaggerPropertyOptions = Parameters<typeof ApiProperty>[0]

export type CookieToken =
  | typeof SWAGGER_ACCESS_TOKEN_AUTH_NAME
  | typeof SWAGGER_REFRESH_TOKEN_AUTH_NAME
