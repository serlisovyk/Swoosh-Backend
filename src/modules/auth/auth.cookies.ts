import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { isDev } from '@shared/utils'
import { REFRESH_TOKEN_COOKIE_NAME } from './auth.constants'
import { RefreshTokenCookieOptions } from './auth.types'

export function buildRefreshTokenCookieOptions(
  configService: ConfigService,
): RefreshTokenCookieOptions {
  return {
    domain: configService.get<string>('COOKIE_DOMAIN'),
    secure: !isDev(configService),
    sameSite: isDev(configService) ? 'lax' : 'none',
  }
}

export function setRefreshTokenCookie(
  response: Response,
  refreshToken: string,
  expiresAt: Date,
  options: RefreshTokenCookieOptions,
) {
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    ...options,
    expires: expiresAt,
  })
}

export function clearRefreshTokenCookie(
  response: Response,
  options: RefreshTokenCookieOptions,
) {
  response.cookie(REFRESH_TOKEN_COOKIE_NAME, null, {
    httpOnly: true,
    ...options,
    expires: new Date(0),
  })
}
