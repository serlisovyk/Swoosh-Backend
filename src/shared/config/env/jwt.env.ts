import { IsNotEmpty, IsString } from 'class-validator'

export class JwtConfig {
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string

  @IsString()
  @IsNotEmpty()
  RESET_TOKEN_SECRET!: string

  @IsString()
  @IsNotEmpty()
  AUTH_DUMMY_PASSWORD_HASH!: string

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_EXPIRES_IN!: string

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_EXPIRES_IN!: string
}
