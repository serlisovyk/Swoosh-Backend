import { ConfigService } from '@nestjs/config'
import { ITurnstileOptions } from 'nest-cloudflare-turnstile'
import { AppEnv } from '@shared/config'
import { getEnv } from '@shared/utils'
import {
  createCaptchaException,
  getCaptchaTokenFromRequest,
} from './captcha.utils'

export function getCaptchaConfig(
  configService: ConfigService<AppEnv, true>,
): ITurnstileOptions {
  const secretKey = getEnv(
    configService,
    'captcha.CLOUDFLARE_TURNSTILE_SECRET_KEY',
  )

  return {
    secretKey,
    tokenResponse: getCaptchaTokenFromRequest,
    exceptionFactory: createCaptchaException,
  }
}
