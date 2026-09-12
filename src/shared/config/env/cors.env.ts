import { Transform, TransformFnParams } from 'class-transformer'
import { IsArray, IsOptional, IsString } from 'class-validator'
import { parseCorsDomainsConfigValue } from '@shared/utils'

export class CorsConfig {
  @Transform(({ value }: TransformFnParams) =>
    parseCorsDomainsConfigValue(typeof value === 'string' ? value : undefined),
  )
  @IsArray()
  CORS_DOMAINS!: string[]

  @IsOptional()
  @IsString()
  COOKIE_DOMAIN?: string
}
