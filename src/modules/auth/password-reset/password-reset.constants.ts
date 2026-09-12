export const RESET_PASSWORD_URL = '/auth/reset-password'

export const AUTH_PASSWORD_RESET_REQUEST_THROTTLE = {
  default: { limit: 3, ttl: 600_000 },
} as const

export const AUTH_PASSWORD_RESET_THROTTLE = {
  default: { limit: 5, ttl: 600_000 },
} as const
