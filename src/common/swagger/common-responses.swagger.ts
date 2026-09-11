import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ErrorResponseDocs } from '@common/errors'

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
