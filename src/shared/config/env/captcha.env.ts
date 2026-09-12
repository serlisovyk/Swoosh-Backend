import { IsNotEmpty, IsString } from 'class-validator'

export class CaptchaConfig {
  @IsString()
  @IsNotEmpty()
  CLOUDFLARE_TURNSTILE_SECRET_KEY!: string
}
