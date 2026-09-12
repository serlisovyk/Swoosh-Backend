import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class EmailConfig {
  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY!: string

  @IsEmail()
  EMAIL_SENDER!: string
}
