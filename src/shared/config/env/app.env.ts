import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator'
import { NODE_ENV } from '@shared/constants'

export class AppConfig {
  @IsEnum(NODE_ENV)
  NODE_ENV!: NODE_ENV

  @IsString()
  @IsNotEmpty()
  APP_NAME!: string

  @IsUrl({ require_tld: false })
  CLIENT_URL!: string

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  PORT!: number
}
