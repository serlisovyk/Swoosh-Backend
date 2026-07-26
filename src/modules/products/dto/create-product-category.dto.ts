import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { trimStringValue } from '@shared/utils'
import {
  PRODUCT_CATEGORY_NAME_EMPTY_ERROR,
  PRODUCT_CATEGORY_NAME_STRING_ERROR,
} from '../products.constants'

export class CreateProductCategoryDto {
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: PRODUCT_CATEGORY_NAME_STRING_ERROR })
  @IsNotEmpty({ message: PRODUCT_CATEGORY_NAME_EMPTY_ERROR })
  name!: string
}
