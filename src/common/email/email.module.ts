import { Module } from '@nestjs/common'
import { ResendModule } from 'nestjs-resend'
import { ConfigService } from '@nestjs/config'
import { EmailService } from './email.service'
import { getResendConfig } from './resend.config'

@Module({
  imports: [
    ResendModule.forRootAsync({
      useFactory: getResendConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
