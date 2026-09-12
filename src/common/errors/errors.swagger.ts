import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ERROR_CODES } from './error-codes.constants'

export class ErrorBodyDocs {
  @ApiProperty({
    description: 'Stable, machine-readable error code.',
    enum: ERROR_CODES,
    example: ERROR_CODES.BAD_REQUEST,
  })
  code!: string

  @ApiProperty({
    description: 'Short human-readable summary, no internal details.',
    example: 'Invalid query parameters',
  })
  message!: string

  @ApiPropertyOptional({
    description:
      'Per-field validation messages, present only for VALIDATION_ERROR. Whole-object errors use the "_root" key.',
    example: { page: 'Invalid input: expected number, received string' },
  })
  fields?: Record<string, string>
}

export class ErrorResponseDocs {
  @ApiProperty({ type: ErrorBodyDocs })
  error!: ErrorBodyDocs
}

export function ApiAuthRequiredDocs() {
  return ApiUnauthorizedResponse({
    description: 'Authentication is required.',
    type: ErrorResponseDocs,
  })
}

export function ApiValidationErrorDocs() {
  return ApiBadRequestResponse({
    description: 'Request body validation failed.',
    type: ErrorResponseDocs,
  })
}

export function ApiInvalidQueryDocs() {
  return ApiBadRequestResponse({
    description: 'One or more query parameters are invalid.',
    type: ErrorResponseDocs,
  })
}

export function ApiNotFoundDocs(entity: string) {
  return ApiNotFoundResponse({
    description: `${entity} was not found.`,
    type: ErrorResponseDocs,
  })
}
