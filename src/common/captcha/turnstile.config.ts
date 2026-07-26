import { ConfigService } from '@nestjs/config'
import { ITurnstileOptions } from 'nest-cloudflare-turnstile'
import {
  createTurnstileException,
  getTokenFromResponse,
} from './turnstile.utils'

export function getTurnstileConfig(
  configService: ConfigService,
): ITurnstileOptions {
  const secretKey = configService.getOrThrow<string>(
    'CLOUDFLARE_TURNSTILE_SECRET_KEY',
  )

  return {
    secretKey,
    tokenResponse: getTokenFromResponse,
    exceptionFactory: createTurnstileException,
  }
}
