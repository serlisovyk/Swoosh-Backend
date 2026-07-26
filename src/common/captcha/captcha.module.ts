import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TurnstileModule } from 'nest-cloudflare-turnstile'
import { getTurnstileConfig } from './turnstile.config'

@Module({
  imports: [
    TurnstileModule.forRootAsync({
      useFactory: getTurnstileConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [TurnstileModule],
})
export class CaptchaModule {}
