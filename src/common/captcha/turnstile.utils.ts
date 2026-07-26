import { BadRequestException } from '@nestjs/common'
import type { Request } from 'express'
import {
  CAPTCHA_TOKEN_IS_REQUIRED_ERROR,
  INVALID_CAPTCHA_TOKEN_ERROR,
  TURNSTILE_TOKEN_HEADER,
} from './captcha.constants'

type TurnstileExceptionReason = 'missing' | 'invalid'

export function createTurnstileException(reason: TurnstileExceptionReason) {
  if (reason === 'missing') {
    return new BadRequestException(CAPTCHA_TOKEN_IS_REQUIRED_ERROR)
  }

  return new BadRequestException(INVALID_CAPTCHA_TOKEN_ERROR)
}

export function getTokenFromResponse(request: Request): string {
  const token = request.headers[TURNSTILE_TOKEN_HEADER]

  return Array.isArray(token) ? token[0] : token || ''
}
