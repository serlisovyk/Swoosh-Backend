import { Transform } from 'class-transformer'
import { IsHexColor, IsNotEmpty, IsString } from 'class-validator'
import { trimStringValue } from '@shared/utils'
import {
  ProductsColorHexPropertyDocs,
  ProductsColorNamePropertyDocs,
} from '../products.swagger'
import {
  PRODUCT_COLOR_HEX_EMPTY_ERROR,
  PRODUCT_COLOR_HEX_FORMAT_ERROR,
  PRODUCT_COLOR_HEX_STRING_ERROR,
  PRODUCT_COLOR_NAME_EMPTY_ERROR,
  PRODUCT_COLOR_NAME_STRING_ERROR,
} from '../products.constants'

export class CreateProductColorDto {
  @ProductsColorNamePropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: PRODUCT_COLOR_NAME_STRING_ERROR })
  @IsNotEmpty({ message: PRODUCT_COLOR_NAME_EMPTY_ERROR })
  name!: string

  @ProductsColorHexPropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: PRODUCT_COLOR_HEX_STRING_ERROR })
  @IsNotEmpty({ message: PRODUCT_COLOR_HEX_EMPTY_ERROR })
  @IsHexColor({ message: PRODUCT_COLOR_HEX_FORMAT_ERROR })
  hex!: string
}
