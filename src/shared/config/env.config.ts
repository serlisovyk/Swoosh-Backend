import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import {
  AppConfig,
  CaptchaConfig,
  CorsConfig,
  EmailConfig,
  JwtConfig,
  MongoConfig,
  SwaggerConfig,
  ThrottlerConfig,
} from './env'

export class AppEnv {
  @ValidateNested()
  @Type(() => AppConfig)
  app!: AppConfig

  @ValidateNested()
  @Type(() => CorsConfig)
  cors!: CorsConfig

  @ValidateNested()
  @Type(() => JwtConfig)
  jwt!: JwtConfig

  @ValidateNested()
  @Type(() => CaptchaConfig)
  captcha!: CaptchaConfig

  @ValidateNested()
  @Type(() => SwaggerConfig)
  swagger!: SwaggerConfig

  @ValidateNested()
  @Type(() => MongoConfig)
  mongo!: MongoConfig

  @ValidateNested()
  @Type(() => EmailConfig)
  email!: EmailConfig

  @ValidateNested()
  @Type(() => ThrottlerConfig)
  throttler!: ThrottlerConfig
}
