import { BadRequestException } from '@nestjs/common'
import type { Request } from 'express'
import {
  CAPTCHA_TOKEN_HEADER,
  CAPTCHA_TOKEN_IS_REQUIRED_ERROR,
  INVALID_CAPTCHA_TOKEN_ERROR,
} from './captcha.constants'
import type { CaptchaExceptionReason } from './captcha.types'

export function createCaptchaException(reason: CaptchaExceptionReason) {
  if (reason === 'missing') {
    return new BadRequestException(CAPTCHA_TOKEN_IS_REQUIRED_ERROR)
  }

  return new BadRequestException(INVALID_CAPTCHA_TOKEN_ERROR)
}

export function getCaptchaTokenFromRequest(request: Request): string {
  const token = request.headers[CAPTCHA_TOKEN_HEADER]

  if (Array.isArray(token)) return token[0] ?? ''

  return token || ''
}
