export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken' as const
export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken' as const

export const INVALID_PASSWORD_ERROR = 'Неверный пароль'
export const INVALID_CREDENTIALS_ERROR = 'Неверный email или пароль'
export const USER_NOT_FOUND_ERROR = 'Пользователь с таким email не найден'
export const FAILED_TO_CREATE_USER_ERROR = 'Не удалось создать пользователя'

export const INVALID_REFRESH_TOKEN_ERROR = 'Неверный refresh токен'
export const REFRESH_TOKEN_MISSING_ERROR = 'Отсутствует refresh токен'

export const SOCIAL_AUTH_PROVIDER = {
  GOOGLE: 'google',
  GITHUB: 'github',
} as const

export const SOCIAL_AUTH_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const

export const SOCIAL_AUTH_REDIRECT_URL = '/auth/social-auth'

export const INVALID_OR_EXPIRED_EMAIL_VERIFICATION_TOKEN_ERROR =
  'Недействительная или просроченная ссылка для подтверждения почты'
export const EMAIL_VERIFICATION_REQUIRED_ERROR =
  'Для изменения данных профиля нужно подтвердить почту'

export const EMAIL_VALIDATION_ERROR = 'Email должен быть валидным email адресом'
export const PASSWORD_STRING_ERROR = 'Пароль должен быть строкой'
export const PASSWORD_MIN_LENGTH_ERROR =
  'Пароль должен быть не менее 6 символов'
export const NAME_STRING_ERROR = 'Имя должно быть строкой'
export const PHONE_STRING_ERROR = 'Телефон должен быть строкой'

export const TOKEN_NOT_EMPTY_ERROR = 'Токен не должен быть пустым'
export const TOKEN_STRING_ERROR = 'Токен должен быть строкой'
export const INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR =
  'Недействительная или просроченная ссылка для сброса пароля'

export const RESET_PASSWORD_URL = '/auth/reset-password'
export const RESET_PASSWORD_SUBJECT = 'Сброс пароля'

export const VERIFY_EMAIL_URL = '/auth/verify-email'
export const VERIFY_EMAIL_SUBJECT = 'Подтверждение почты'

export const AUTH_LOGIN_THROTTLE = {
  default: { limit: 5, ttl: 60_000 },
} as const

export const AUTH_REGISTER_THROTTLE = {
  default: { limit: 5, ttl: 300_000 },
} as const

export const AUTH_PASSWORD_RESET_REQUEST_THROTTLE = {
  default: { limit: 3, ttl: 600_000 },
} as const

export const AUTH_PASSWORD_RESET_THROTTLE = {
  default: { limit: 5, ttl: 600_000 },
} as const

export const AUTH_EMAIL_VERIFICATION_REQUEST_THROTTLE = {
  default: { limit: 3, ttl: 600_000 },
} as const

export const AUTH_EMAIL_VERIFICATION_THROTTLE = {
  default: { limit: 5, ttl: 600_000 },
} as const

export const AUTH_EMAIL_EXAMPLE = 'john.swoosh@example.com'
export const AUTH_PASSWORD_EXAMPLE = 'secret123'
export const AUTH_NAME_EXAMPLE = 'John Doe'
export const AUTH_PHONE_EXAMPLE = '+380991112233'
export const AUTH_RESET_TOKEN_EXAMPLE = 'reset-token-example-123'
export const AUTH_EMAIL_VERIFICATION_TOKEN_EXAMPLE =
  'email-verification-token-example-123'
export const AUTH_SESSION_ID_EXAMPLE = '8f5f4ca4-b6b8-4f3d-846f-7fe5b7ca6ab2'
export const AUTH_SESSION_DEVICE_LABEL_EXAMPLE = 'Chrome, Windows'
export const AUTH_SESSION_IP_EXAMPLE = '203.0.113.5'

export const AUTH_SESSION_UNKNOWN_DEVICE_LABEL = 'Неизвестное устройство'
export const AUTH_SESSION_WINDOWS_LABEL = 'Windows'
export const AUTH_SESSION_MACOS_LABEL = 'macOS'
export const AUTH_SESSION_IOS_LABEL = 'iOS'
export const AUTH_SESSION_ANDROID_LABEL = 'Android'
export const AUTH_SESSION_LINUX_LABEL = 'Linux'
export const AUTH_SESSION_EDGE_LABEL = 'Edge'
export const AUTH_SESSION_OPERA_LABEL = 'Opera'
export const AUTH_SESSION_CHROME_LABEL = 'Chrome'
export const AUTH_SESSION_FIREFOX_LABEL = 'Firefox'
export const AUTH_SESSION_SAFARI_LABEL = 'Safari'
export const CURRENT_SESSION_REVOKE_ERROR =
  'Невозможно завершить текущую сессию'
