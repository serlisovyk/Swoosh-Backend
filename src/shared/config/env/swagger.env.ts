import { Transform, TransformFnParams } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { parseSwaggerEnabled } from './parse-swagger-enabled.utils'

export class SwaggerConfig {
  @Transform(({ value }: TransformFnParams) => parseSwaggerEnabled(value))
  @IsBoolean()
  SWAGGER_ENABLED!: boolean

  @IsOptional()
  @IsString()
  SWAGGER_USER?: string

  @IsOptional()
  @IsString()
  SWAGGER_PASSWORD?: string
}
