import { Transform } from 'class-transformer'
import { IsEmail, IsString, MinLength } from 'class-validator'
import { normalizeEmailValue } from '@shared/utils'
import {
  AuthEmailPropertyDocs,
  AuthPasswordPropertyDocs,
} from '../auth.swagger'
import {
  EMAIL_VALIDATION_ERROR,
  PASSWORD_STRING_ERROR,
  PASSWORD_MIN_LENGTH_ERROR,
} from '../auth.constants'
import { FavoriteProductIdsDto } from './favorite-product-ids.dto'

export class LoginDto extends FavoriteProductIdsDto {
  @AuthEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsEmail({}, { message: EMAIL_VALIDATION_ERROR })
  email!: string

  @AuthPasswordPropertyDocs()
  @IsString({ message: PASSWORD_STRING_ERROR })
  @MinLength(6, { message: PASSWORD_MIN_LENGTH_ERROR })
  password!: string
}
