import { BadRequestException } from '@nestjs/common'
import type { Request } from 'express'
import {
  CAPTCHA_TOKEN_HEADER,
  CAPTCHA_TOKEN_IS_REQUIRED_ERROR,
  INVALID_CAPTCHA_TOKEN_ERROR,
} from './captcha.constants'

type CaptchaExceptionReason = 'missing' | 'invalid'

export function createCaptchaException(reason: CaptchaExceptionReason) {
  if (reason === 'missing') {
    return new BadRequestException(CAPTCHA_TOKEN_IS_REQUIRED_ERROR)
  }

  return new BadRequestException(INVALID_CAPTCHA_TOKEN_ERROR)
}

export function getTokenFromResponse(request: Request): string {
  const token = request.headers[CAPTCHA_TOKEN_HEADER]

  return Array.isArray(token) ? (token[0] ?? '') : token || ''
}
