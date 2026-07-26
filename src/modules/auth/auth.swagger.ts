import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiParam,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
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
  AUTH_EMAIL_VERIFICATION_TOKEN_EXAMPLE,
  AUTH_NAME_EXAMPLE,
  AUTH_PASSWORD_EXAMPLE,
  AUTH_PHONE_EXAMPLE,
  AUTH_RESET_TOKEN_EXAMPLE,
  AUTH_SESSION_DEVICE_LABEL_EXAMPLE,
  AUTH_SESSION_ID_EXAMPLE,
  AUTH_SESSION_IP_EXAMPLE,
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

export const AuthEmailVerificationTokenPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Email verification token received by email.',
    example: AUTH_EMAIL_VERIFICATION_TOKEN_EXAMPLE,
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

export class AuthSessionResponseDocs {
  @AuthUserPropertyDocs(UserResponseDocs)
  user!: UserResponseDocs
}

export class AuthSessionItemResponseDocs {
  @ApiProperty({
    description: 'Auth session identifier.',
    example: AUTH_SESSION_ID_EXAMPLE,
  })
  sessionId!: string

  @ApiProperty({
    description: 'Heuristic browser and device label derived from user-agent.',
    example: AUTH_SESSION_DEVICE_LABEL_EXAMPLE,
  })
  deviceLabel!: string

  @ApiProperty({
    description: 'Last known client IP for the session.',
    example: AUTH_SESSION_IP_EXAMPLE,
    nullable: true,
  })
  ip!: string | null

  @ApiProperty({
    description: 'Approximate last session activity timestamp.',
    example: '2026-04-11T11:22:33.000Z',
    format: 'date-time',
  })
  lastUsedAt!: string

  @ApiProperty({
    description: 'Session creation timestamp.',
    example: '2026-04-09T08:10:00.000Z',
    format: 'date-time',
  })
  createdAt!: string

  @ApiProperty({
    description: 'Whether this session belongs to the current client.',
    example: true,
  })
  isCurrent!: boolean
}

export class AuthSessionsResponseDocs {
  @ApiProperty({
    description: 'Active refresh sessions for the current user.',
    type: [AuthSessionItemResponseDocs],
  })
  sessions!: AuthSessionItemResponseDocs[]
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
        'Creates a new user account, sends an email verification link, validates Cloudflare Turnstile, optionally merges guest favorite ids, creates a server-side auth session for refresh rotation, and sets access/refresh tokens in HttpOnly cookies.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'User registered successfully.',
      type: AuthSessionResponseDocs,
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
        'Authenticates a user, validates Cloudflare Turnstile, optionally merges guest favorite ids, creates a server-side auth session for refresh rotation, and sets access/refresh tokens in HttpOnly cookies.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'User logged in successfully.',
      type: AuthSessionResponseDocs,
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
        'Reads the refresh token from cookies, validates it against the stored auth session, rotates the current refresh token inside that session, and sets new HttpOnly cookies.',
      security: [{ [SWAGGER_REFRESH_TOKEN_AUTH_NAME]: [] }],
    }),
    ApiCreatedResponse({
      description: 'Tokens refreshed successfully.',
      type: AuthSessionResponseDocs,
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
      description:
        'Clears auth cookies and revokes the current refresh session when it can be resolved from the refresh-token cookie.',
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

export function AuthSessionsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get active auth sessions',
      description:
        'Returns the current user refresh sessions, hides expired records, and marks the current session when the refresh-token cookie can be resolved.',
    }),
    ApiOkResponse({
      description: 'Active sessions returned successfully.',
      type: AuthSessionsResponseDocs,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
  )
}

export function AuthRevokeSessionDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Revoke another auth session',
      description:
        'Deletes one active refresh session of the current user. The current session must be terminated via the logout endpoint instead.',
    }),
    ApiParam({
      name: 'sessionId',
      description: 'Session identifier to revoke.',
      example: AUTH_SESSION_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Session revoked successfully.',
      schema: { type: 'boolean', example: true },
    }),
    ApiBadRequestResponse({
      description: 'The current session cannot be revoked through this endpoint.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
  )
}

export function AuthLogoutAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Log out from all devices',
      description:
        'Deletes all refresh sessions for the current user, clears auth cookies, and signs out the current device as well.',
    }),
    ApiOkResponse({
      description: 'All sessions revoked successfully.',
      schema: { type: 'boolean', example: true },
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
  )
}

function createSocialAuthDocs(providerLabel: string) {
  return applyDecorators(
    ApiOperation({
      summary: `Start ${providerLabel} auth`,
      description: `Redirects the browser to the ${providerLabel} OAuth consent screen.`,
      security: [],
    }),
    ApiFoundResponse({
      description: `Redirect to ${providerLabel} OAuth provider.`,
    }),
  )
}

function createSocialAuthCallbackDocs(providerLabel: string) {
  return applyDecorators(
    ApiOperation({
      summary: `${providerLabel} auth callback`,
      description:
        'Processes the OAuth callback, creates a server-side auth session on success, sets auth cookies, and redirects the browser to the frontend social-auth callback page.',
      security: [],
    }),
    ApiFoundResponse({
      description: 'Redirect to frontend after social auth handling.',
    }),
  )
}

export function AuthGoogleLoginDocs() {
  return createSocialAuthDocs('Google')
}

export function AuthGoogleCallbackDocs() {
  return createSocialAuthCallbackDocs('Google')
}

export function AuthGithubLoginDocs() {
  return createSocialAuthDocs('GitHub')
}

export function AuthGithubCallbackDocs() {
  return createSocialAuthCallbackDocs('GitHub')
}

export function AuthRequestEmailVerificationDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Request email verification',
      description:
        'Generates and sends a new email verification link for the current authenticated user when the email is not verified.',
    }),
    ApiOkResponse({
      description: 'Email verification request processed successfully.',
      schema: { type: 'boolean', example: true },
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
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

export function AuthVerifyEmailDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify email by token',
      description:
        'Verifies the user email when the verification token is valid and not expired.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Email verified successfully.',
      schema: { type: 'boolean', example: true },
    }),
    ApiBadRequestResponse({
      description:
        'Verification token is invalid, expired or request body is invalid.',
    }),
  )
}
