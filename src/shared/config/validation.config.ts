import { ValidationError, ValidationPipeOptions } from '@nestjs/common'

export function getValidationConfig(
  exceptionFactory: (errors: ValidationError[]) => unknown,
): ValidationPipeOptions {
  return {
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    exceptionFactory,
  }
}
