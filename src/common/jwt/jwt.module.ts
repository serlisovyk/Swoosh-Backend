import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule as NestJwtModule } from '@nestjs/jwt'
import { getJwtConfig } from './jwt.config'

@Module({
  imports: [
    NestJwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule {}
