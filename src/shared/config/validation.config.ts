import { ValidationError, ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'

export function setupValidation(
  app: NestExpressApplication,
  exceptionFactory: (errors: ValidationError[]) => unknown,
) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory,
    }),
  )
}
