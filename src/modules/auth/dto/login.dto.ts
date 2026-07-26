import { Transform } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import {
  FAVORITES_PRODUCT_IDS_ARRAY_ERROR,
  FAVORITES_PRODUCT_ID_FORMAT_ERROR,
  FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR,
  FAVORITES_MAX_PRODUCT_IDS,
} from '@modules/favorites/favorites.constants'
import { normalizeEmailValue } from '@shared/utils'
import { FavoritesOptionalProductIdsPropertyDocs } from '@modules/favorites/favorites.swagger'
import {
  AuthEmailPropertyDocs,
  AuthPasswordPropertyDocs,
} from '../auth.swagger'
import {
  EMAIL_VALIDATION_ERROR,
  PASSWORD_STRING_ERROR,
  PASSWORD_MIN_LENGTH_ERROR,
} from '../auth.constants'

export class LoginDto {
  @AuthEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsEmail({}, { message: EMAIL_VALIDATION_ERROR })
  email!: string

  @AuthPasswordPropertyDocs()
  @IsString({ message: PASSWORD_STRING_ERROR })
  @MinLength(6, { message: PASSWORD_MIN_LENGTH_ERROR })
  password!: string

  @FavoritesOptionalProductIdsPropertyDocs()
  @IsOptional()
  @IsArray({ message: FAVORITES_PRODUCT_IDS_ARRAY_ERROR })
  @IsMongoId({ each: true, message: FAVORITES_PRODUCT_ID_FORMAT_ERROR })
  @ArrayMaxSize(FAVORITES_MAX_PRODUCT_IDS, {
    message: FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR,
  })
  @ArrayUnique()
  favoriteProductIds?: string[]
}
