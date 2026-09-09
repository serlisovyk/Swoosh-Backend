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
  SWAGGER_REFRESH_TOKEN_AUTH_NAME,
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
} from '@common/swagger'
import { TURNSTILE_TOKEN_HEADER } from '@common/captcha'
import { UserResponseDocs } from '../user/user.swagger'
import {
  AUTH_EMAIL_EXAMPLE,
  AUTH_NAME_EXAMPLE,
  AUTH_PASSWORD_EXAMPLE,
  AUTH_PHONE_EXAMPLE,
  AUTH_RESET_TOKEN_EXAMPLE,
} from './auth.constants'

export function AuthTagDocs() {
  return ApiTags('Auth')
}

export const AuthEmailPropertyDocs = createPropertyDocsDecorator({
  description: 'User email address.',
  example: AUTH_EMAIL_EXAMPLE,
})

export const AuthPasswordPropertyDocs = createPropertyDocsDecorator({
  description: 'User password.',
  example: AUTH_PASSWORD_EXAMPLE,
  minLength: 6,
})

export const AuthOptionalNamePropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'User display name.',
    example: AUTH_NAME_EXAMPLE,
  },
)

export const AuthOptionalPhonePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'User phone number.',
    example: AUTH_PHONE_EXAMPLE,
  })

export const AuthResetTokenPropertyDocs = createPropertyDocsDecorator({
  description: 'Password reset token received by email.',
  example: AUTH_RESET_TOKEN_EXAMPLE,
})

export const AuthNewPasswordPropertyDocs = createPropertyDocsDecorator({
  description: 'New password that will replace the current one.',
  example: 'newSecret123',
  minLength: 6,
})

export function AuthUserPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Authenticated user data.',
    type: model,
  })
}

export class AuthTokensResponseDocs {
  @AuthUserPropertyDocs(UserResponseDocs)
  user!: UserResponseDocs

  @ApiProperty({
    description: 'JWT access token. Pass it as Authorization: Bearer <token>.',
    example: 'access-token',
  })
  accessToken!: string
}

export function AuthCaptchaHeaderDocs() {
  return ApiHeader({
    name: TURNSTILE_TOKEN_HEADER,
    description: 'Токен Cloudflare Turnstile для защиты auth-эндпоинтов.',
    required: true,
  })
}

export function AuthRegisterDocs() {
  return applyDecorators(
    AuthCaptchaHeaderDocs(),
    ApiOperation({
      summary: 'Register a new user',
      description:
        'Creates a new user account, validates Cloudflare Turnstile, optionally merges guest favorite ids, returns an access token, and stores the refresh token in an HttpOnly cookie.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'User registered successfully.',
      type: AuthTokensResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Request body validation failed.',
    }),
    ApiConflictResponse({
      description: 'User with this email already exists.',
    }),
  )
}

export function AuthLoginDocs() {
  return applyDecorators(
    AuthCaptchaHeaderDocs(),
    ApiOperation({
      summary: 'Log in user',
      description:
        'Authenticates a user, validates Cloudflare Turnstile, optionally merges guest favorite ids, returns an access token, and stores the refresh token in an HttpOnly cookie.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'User logged in successfully.',
      type: AuthTokensResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Request body validation failed.',
    }),
    ApiUnauthorizedResponse({
      description: 'Email or password is invalid.',
    }),
  )
}

export function AuthNewTokensDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh auth tokens',
      description:
        'Reads the refresh token from cookies, validates it, returns a new access token, and stores a new refresh token in an HttpOnly cookie.',
      security: [{ [SWAGGER_REFRESH_TOKEN_AUTH_NAME]: [] }],
    }),
    ApiCreatedResponse({
      description: 'Tokens refreshed successfully.',
      type: AuthTokensResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Refresh token is missing or invalid.',
    }),
    ApiNotFoundResponse({
      description: 'User for the refresh token was not found.',
    }),
  )
}

export function AuthLogoutDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Log out user',
      description: 'Clears the refresh-token cookie.',
      security: [{ [SWAGGER_REFRESH_TOKEN_AUTH_NAME]: [] }],
    }),
    ApiOkResponse({
      description: 'User logged out successfully.',
      schema: { type: 'boolean', example: true },
    }),
  )
}

export function AuthRequestPasswordResetDocs() {
  return applyDecorators(
    AuthCaptchaHeaderDocs(),
    ApiOperation({
      summary: 'Request password reset',
      description:
        'Validates Cloudflare Turnstile and always returns true to avoid leaking whether the email exists in the system.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Password reset request processed successfully.',
      schema: { type: 'boolean', example: true },
    }),
    ApiBadRequestResponse({
      description: 'Request body validation failed.',
    }),
  )
}

export function AuthResetPasswordDocs() {
  return applyDecorators(
    AuthCaptchaHeaderDocs(),
    ApiOperation({
      summary: 'Reset password by token',
      description:
        'Validates Cloudflare Turnstile and resets the password when the reset token is valid.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Password reset successfully.',
      schema: { type: 'boolean', example: true },
    }),
    ApiBadRequestResponse({
      description:
        'Reset token is invalid, expired or request body is invalid.',
    }),
  )
}
