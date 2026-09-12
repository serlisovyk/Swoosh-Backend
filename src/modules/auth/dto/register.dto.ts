import { Transform } from 'class-transformer'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'
import { normalizeEmailValue, normalizePhoneValue } from '@shared/utils'
import {
  AuthEmailPropertyDocs,
  AuthOptionalNamePropertyDocs,
  AuthOptionalPhonePropertyDocs,
  AuthPasswordPropertyDocs,
} from '../auth.swagger'
import {
  EMAIL_VALIDATION_ERROR,
  PASSWORD_STRING_ERROR,
  PASSWORD_MIN_LENGTH_ERROR,
} from '../auth.constants'
import { FavoriteProductIdsDto } from './favorite-product-ids.dto'

export class RegisterDto extends FavoriteProductIdsDto {
  @AuthEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsEmail({}, { message: EMAIL_VALIDATION_ERROR })
  email!: string

  @AuthPasswordPropertyDocs()
  @IsString({ message: PASSWORD_STRING_ERROR })
  @MinLength(6, { message: PASSWORD_MIN_LENGTH_ERROR })
  password!: string

  @AuthOptionalNamePropertyDocs()
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string

  @AuthOptionalPhonePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => normalizePhoneValue(value))
  @IsString({ message: 'Телефон должен быть строкой' })
  phone?: string
}
