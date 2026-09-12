export { REFRESH_TOKEN_COOKIE_NAME } from '@shared/constants'

export const INVALID_CREDENTIALS_ERROR = 'Неверный email или пароль'

export const EMAIL_VALIDATION_ERROR = 'Email должен быть валидным email адресом'
export const PASSWORD_STRING_ERROR = 'Пароль должен быть строкой'
export const PASSWORD_MIN_LENGTH_ERROR =
  'Пароль должен быть не менее 6 символов'

export const AUTH_LOGIN_THROTTLE = {
  default: { limit: 5, ttl: 60_000 },
} as const

export const AUTH_REGISTER_THROTTLE = {
  default: { limit: 5, ttl: 300_000 },
} as const
