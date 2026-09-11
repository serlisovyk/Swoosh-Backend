import { BadRequestException, ValidationError } from '@nestjs/common'
import { ROOT_ERROR_FIELD, VALIDATION_ERROR_MESSAGE } from './errors.constants'

export class ValidationFailedException extends BadRequestException {
  constructor(readonly fields: Record<string, string>) {
    super(VALIDATION_ERROR_MESSAGE)
  }
}

function collectFieldMessages(
  error: ValidationError,
  parentPath: string,
  fields: Record<string, string>,
) {
  const path = parentPath ? `${parentPath}.${error.property}` : error.property
  const fieldKey = path || ROOT_ERROR_FIELD

  if (error.constraints) {
    fields[fieldKey] = Object.values(error.constraints).join('; ')
  }

  error.children?.forEach((child) => collectFieldMessages(child, path, fields))
}

export function flattenValidationErrors(
  errors: ValidationError[],
): Record<string, string> {
  const fields: Record<string, string> = {}

  errors.forEach((error) => collectFieldMessages(error, '', fields))

  return fields
}
