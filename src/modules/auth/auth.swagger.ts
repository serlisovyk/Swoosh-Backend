import { ApiValidationErrorDocs, ErrorResponseDocs } from '@common/errors'
import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
} from '@shared/swagger'
import { SWAGGER_REFRESH_TOKEN_AUTH_NAME } from '@shared/constants'
import { CAPTCHA_TOKEN_HEADER } from '@common/captcha'
import { UsersResponseDocs } from '../users/users.swagger'

export function AuthTagDocs() {
  return ApiTags('Auth')
}

export const AuthEmailPropertyDocs = createPropertyDocsDecorator({
  description: 'Email пользователя.',
  example: 'john.swoosh@example.com',
})

export const AuthPasswordPropertyDocs = createPropertyDocsDecorator({
  description: 'Пароль пользователя.',
  example: 'secret123',
  minLength: 6,
})

export const AuthOptionalNamePropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'Отображаемое имя пользователя.',
    example: 'John Doe',
  },
)

export const AuthOptionalPhonePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Номер телефона пользователя.',
    example: '+380991112233',
  })

export function AuthUserPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Данные аутентифицированного пользователя.',
    type: model,
  })
}

export class AuthTokensResponseDocs {
  @AuthUserPropertyDocs(UsersResponseDocs)
  user!: UsersResponseDocs

  @ApiProperty({
    description:
      'JWT access-токен. Передавайте его в заголовке Authorization: Bearer <token>.',
    example: 'access-token',
  })
  accessToken!: string
}

export function AuthCaptchaHeaderDocs() {
  return ApiHeader({
    name: CAPTCHA_TOKEN_HEADER,
    description: 'Токен Cloudflare Turnstile для защиты auth-эндпоинтов.',
    required: true,
  })
}

export function AuthRegisterDocs() {
  return applyDecorators(
    AuthCaptchaHeaderDocs(),
    ApiOperation({
      summary: 'Регистрация нового пользователя',
      description:
        'Создаёт новую учётную запись, проверяет Cloudflare Turnstile, опционально объединяет гостевое избранное, возвращает access-токен и сохраняет refresh-токен в HttpOnly cookie.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'Пользователь успешно зарегистрирован.',
      type: AuthTokensResponseDocs,
    }),
    ApiValidationErrorDocs(),
    ApiConflictResponse({
      description: 'Пользователь с таким email уже существует.',
      type: ErrorResponseDocs,
    }),
  )
}

export function AuthLoginDocs() {
  return applyDecorators(
    AuthCaptchaHeaderDocs(),
    ApiOperation({
      summary: 'Вход пользователя',
      description:
        'Аутентифицирует пользователя, проверяет Cloudflare Turnstile, опционально объединяет гостевое избранное, возвращает access-токен и сохраняет refresh-токен в HttpOnly cookie.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'Пользователь успешно вошёл в систему.',
      type: AuthTokensResponseDocs,
    }),
    ApiValidationErrorDocs(),
    ApiUnauthorizedResponse({
      description: 'Неверный email или пароль.',
      type: ErrorResponseDocs,
    }),
  )
}

export function AuthNewTokensDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Обновить токены аутентификации',
      description:
        'Читает refresh-токен из cookie, проверяет его, возвращает новый access-токен и сохраняет новый refresh-токен в HttpOnly cookie.',
      security: [{ [SWAGGER_REFRESH_TOKEN_AUTH_NAME]: [] }],
    }),
    ApiCreatedResponse({
      description: 'Токены успешно обновлены.',
      type: AuthTokensResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Refresh-токен отсутствует или недействителен.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Пользователь по refresh-токену не найден.',
      type: ErrorResponseDocs,
    }),
  )
}

export function AuthLogoutDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Выход пользователя',
      description: 'Очищает cookie с refresh-токеном.',
      security: [{ [SWAGGER_REFRESH_TOKEN_AUTH_NAME]: [] }],
    }),
    ApiOkResponse({
      description: 'Пользователь успешно вышел из системы.',
      schema: { type: 'boolean', example: true },
    }),
  )
}
