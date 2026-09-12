import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { trimStringValue } from '@shared/utils'
import { ProductCategoryNamePropertyDocs } from '../product-category.swagger'
import {
  PRODUCT_CATEGORY_NAME_EMPTY_ERROR,
  PRODUCT_CATEGORY_NAME_STRING_ERROR,
} from '../product-category.constants'

export class CreateProductCategoryDto {
  @ProductCategoryNamePropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: PRODUCT_CATEGORY_NAME_STRING_ERROR })
  @IsNotEmpty({ message: PRODUCT_CATEGORY_NAME_EMPTY_ERROR })
  name!: string
}
