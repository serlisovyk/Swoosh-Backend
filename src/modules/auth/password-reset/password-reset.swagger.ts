import { ErrorResponseDocs } from '@common/errors'
import { applyDecorators } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger'
import {
  ApiValidationErrorDocs,
  createPropertyDocsDecorator,
} from '@common/swagger'
import { AuthCaptchaHeaderDocs } from '../auth.swagger'

export const AuthResetTokenPropertyDocs = createPropertyDocsDecorator({
  description: 'Токен сброса пароля, полученный по email.',
  example: 'reset-token-example-123',
})

export const AuthNewPasswordPropertyDocs = createPropertyDocsDecorator({
  description: 'Новый пароль, который заменит текущий.',
  example: 'newSecret123',
  minLength: 6,
})

export function AuthRequestPasswordResetDocs() {
  return applyDecorators(
    AuthCaptchaHeaderDocs(),
    ApiOperation({
      summary: 'Запросить сброс пароля',
      description:
        'Проверяет Cloudflare Turnstile и всегда возвращает true, чтобы не раскрывать, существует ли такой email в системе.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Запрос на сброс пароля обработан успешно.',
      schema: { type: 'boolean', example: true },
    }),
    ApiValidationErrorDocs(),
  )
}

export function AuthResetPasswordDocs() {
  return applyDecorators(
    AuthCaptchaHeaderDocs(),
    ApiOperation({
      summary: 'Сбросить пароль по токену',
      description:
        'Проверяет Cloudflare Turnstile и сбрасывает пароль, если токен сброса действителен.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Пароль успешно сброшен.',
      schema: { type: 'boolean', example: true },
    }),
    ApiBadRequestResponse({
      description:
        'Токен сброса недействителен, истёк, либо тело запроса невалидно.',
      type: ErrorResponseDocs,
    }),
  )
}
