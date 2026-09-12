import { ConfigService } from '@nestjs/config'
import { ITurnstileOptions } from 'nest-cloudflare-turnstile'
import { AppEnv } from '@shared/config'
import {
  createTurnstileException,
  getTokenFromResponse,
} from './turnstile.utils'

export function getTurnstileConfig(
  configService: ConfigService<AppEnv, true>,
): ITurnstileOptions {
  const secretKey = configService.get('CLOUDFLARE_TURNSTILE_SECRET_KEY', {
    infer: true,
  })

  return {
    secretKey,
    tokenResponse: getTokenFromResponse,
    exceptionFactory: createTurnstileException,
  }
}
