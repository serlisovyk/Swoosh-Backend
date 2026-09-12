import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TurnstileModule } from 'nest-cloudflare-turnstile'
import { getCaptchaConfig } from './captcha.config'

@Module({
  imports: [
    TurnstileModule.forRootAsync({
      useFactory: getCaptchaConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [TurnstileModule],
})
export class CaptchaModule {}
