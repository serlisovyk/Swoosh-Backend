import { Transform, Type } from 'class-transformer'
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator'
import { trimStringValue, trimStringArrayValue } from '@shared/utils'
import { CreateProductColorDto } from './create-product-color.dto'
import {
  ProductsCategoryIdPropertyDocs,
  ProductsColorsPropertyDocs,
  ProductsDescriptionPropertyDocs,
  ProductsImagesPropertyDocs,
  ProductsIsHitPropertyDocs,
  ProductsIsNewArrivalPropertyDocs,
  ProductsMaterialPropertyDocs,
  ProductsOldPricePropertyDocs,
  ProductsPricePropertyDocs,
  ProductsSaleCFPropertyDocs,
  ProductsSizesPropertyDocs,
  ProductsTitlePropertyDocs,
} from '../products.swagger'
import {
  PRODUCT_CATEGORY_ID_ERROR,
  PRODUCT_COLORS_ARRAY_ERROR,
  PRODUCT_COLORS_MIN_SIZE_ERROR,
  PRODUCT_DESCRIPTION_EMPTY_ERROR,
  PRODUCT_DESCRIPTION_STRING_ERROR,
  PRODUCT_IMAGES_ARRAY_ERROR,
  PRODUCT_IMAGES_ITEM_EMPTY_ERROR,
  PRODUCT_IMAGES_ITEM_STRING_ERROR,
  PRODUCT_IMAGES_ITEM_URL_ERROR,
  PRODUCT_IMAGES_MIN_SIZE_ERROR,
  PRODUCT_IMAGES_UNIQUE_ERROR,
  PRODUCT_IS_HIT_BOOLEAN_ERROR,
  PRODUCT_IS_NEW_ARRIVAL_BOOLEAN_ERROR,
  PRODUCT_MATERIAL_EMPTY_ERROR,
  PRODUCT_MATERIAL_STRING_ERROR,
  PRODUCT_OLD_PRICE_MIN_ERROR,
  PRODUCT_OLD_PRICE_NUMBER_ERROR,
  PRODUCT_PRICE_MIN_ERROR,
  PRODUCT_PRICE_NUMBER_ERROR,
  PRODUCT_SALE_CF_MIN_ERROR,
  PRODUCT_SALE_CF_NUMBER_ERROR,
  PRODUCT_SIZES_ARRAY_ERROR,
  PRODUCT_SIZES_ITEM_NUMBER_ERROR,
  PRODUCT_SIZES_MIN_SIZE_ERROR,
  PRODUCT_SIZES_UNIQUE_ERROR,
  PRODUCT_TITLE_EMPTY_ERROR,
  PRODUCT_TITLE_STRING_ERROR,
} from '../products.constants'

export class CreateProductDto {
  @ProductsTitlePropertyDocs()
  @Type(() => String)
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: PRODUCT_TITLE_STRING_ERROR })
  @IsNotEmpty({ message: PRODUCT_TITLE_EMPTY_ERROR })
  title!: string

  @ProductsPricePropertyDocs()
  @Type(() => Number)
  @IsNumber({}, { message: PRODUCT_PRICE_NUMBER_ERROR })
  @Min(0, { message: PRODUCT_PRICE_MIN_ERROR })
  price!: number

  @ProductsDescriptionPropertyDocs()
  @Type(() => String)
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: PRODUCT_DESCRIPTION_STRING_ERROR })
  @IsNotEmpty({ message: PRODUCT_DESCRIPTION_EMPTY_ERROR })
  description!: string

  @ProductsImagesPropertyDocs()
  @Transform(({ value }) => trimStringArrayValue(value))
  @IsArray({ message: PRODUCT_IMAGES_ARRAY_ERROR })
  @ArrayMinSize(1, { message: PRODUCT_IMAGES_MIN_SIZE_ERROR })
  @IsString({ each: true, message: PRODUCT_IMAGES_ITEM_STRING_ERROR })
  @IsNotEmpty({ each: true, message: PRODUCT_IMAGES_ITEM_EMPTY_ERROR })
  @IsUrl({}, { each: true, message: PRODUCT_IMAGES_ITEM_URL_ERROR })
  @ArrayUnique({ message: PRODUCT_IMAGES_UNIQUE_ERROR })
  images!: string[]

  @ProductsOldPricePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: PRODUCT_OLD_PRICE_NUMBER_ERROR })
  @Min(0, { message: PRODUCT_OLD_PRICE_MIN_ERROR })
  oldPrice?: number

  @ProductsSaleCFPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: PRODUCT_SALE_CF_NUMBER_ERROR })
  @Min(0, { message: PRODUCT_SALE_CF_MIN_ERROR })
  saleCF?: number

  @ProductsSizesPropertyDocs()
  @IsArray({ message: PRODUCT_SIZES_ARRAY_ERROR })
  @ArrayMinSize(1, { message: PRODUCT_SIZES_MIN_SIZE_ERROR })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: PRODUCT_SIZES_ITEM_NUMBER_ERROR })
  @ArrayUnique({ message: PRODUCT_SIZES_UNIQUE_ERROR })
  sizes!: number[]

  @ProductsMaterialPropertyDocs()
  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: PRODUCT_MATERIAL_STRING_ERROR })
  @IsNotEmpty({ message: PRODUCT_MATERIAL_EMPTY_ERROR })
  material?: string

  @ProductsIsHitPropertyDocs()
  @IsOptional()
  @IsBoolean({ message: PRODUCT_IS_HIT_BOOLEAN_ERROR })
  isHit?: boolean

  @ProductsIsNewArrivalPropertyDocs()
  @IsOptional()
  @IsBoolean({ message: PRODUCT_IS_NEW_ARRIVAL_BOOLEAN_ERROR })
  isNewArrival?: boolean

  @ProductsColorsPropertyDocs(CreateProductColorDto)
  @IsArray({ message: PRODUCT_COLORS_ARRAY_ERROR })
  @ArrayMinSize(1, { message: PRODUCT_COLORS_MIN_SIZE_ERROR })
  @ValidateNested({ each: true })
  @Type(() => CreateProductColorDto)
  colors!: CreateProductColorDto[]

  @ProductsCategoryIdPropertyDocs()
  @Type(() => String)
  @Transform(({ value }) => trimStringValue(value))
  @IsMongoId({ message: PRODUCT_CATEGORY_ID_ERROR })
  categoryId!: string
}
