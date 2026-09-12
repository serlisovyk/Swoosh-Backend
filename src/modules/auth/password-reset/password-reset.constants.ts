export const TOKEN_NOT_EMPTY_ERROR = 'Токен не должен быть пустым'
export const TOKEN_STRING_ERROR = 'Токен должен быть строкой'
export const INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR =
  'Недействительная или просроченная ссылка для сброса пароля'

export const RESET_PASSWORD_URL = '/auth/reset-password'

export const AUTH_PASSWORD_RESET_REQUEST_THROTTLE = {
  default: { limit: 3, ttl: 600_000 },
} as const

export const AUTH_PASSWORD_RESET_THROTTLE = {
  default: { limit: 5, ttl: 600_000 },
} as const

export const AUTH_RESET_TOKEN_EXAMPLE = 'reset-token-example-123'
