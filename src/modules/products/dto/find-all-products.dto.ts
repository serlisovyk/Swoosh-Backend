import { Transform, Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import {
  trimStringValue,
  toBooleanQueryParam,
  toNumberArrayQueryParam,
  toStringArrayQueryParam,
} from '@shared/utils'
import {
  ProductsQueryCategoryPropertyDocs,
  ProductsQueryColorNamePropertyDocs,
  ProductsQueryExcludeIdsPropertyDocs,
  ProductsQueryHasDiscountPropertyDocs,
  ProductsQueryIdsPropertyDocs,
  ProductsQueryIsHitPropertyDocs,
  ProductsQueryIsNewArrivalPropertyDocs,
  ProductsQueryLimitPropertyDocs,
  ProductsQueryMaterialPropertyDocs,
  ProductsQueryPagePropertyDocs,
  ProductsQueryPricePropertyDocs,
  ProductsQuerySearchPropertyDocs,
  ProductsQuerySizePropertyDocs,
  ProductsQuerySortPropertyDocs,
} from '../products.swagger'
import {
  PRODUCT_QUERY_CATEGORY_ARRAY_ERROR,
  PRODUCT_QUERY_CATEGORY_FORMAT_ERROR,
  PRODUCT_QUERY_COLOR_NAME_ARRAY_ERROR,
  PRODUCT_QUERY_COLOR_NAME_STRING_ERROR,
  PRODUCT_QUERY_HAS_DISCOUNT_BOOLEAN_ERROR,
  PRODUCT_QUERY_IDS_ARRAY_ERROR,
  PRODUCT_QUERY_IDS_FORMAT_ERROR,
  PRODUCT_QUERY_IS_HIT_BOOLEAN_ERROR,
  PRODUCT_QUERY_IS_NEW_ARRIVAL_BOOLEAN_ERROR,
  PRODUCT_QUERY_LIMIT_MAX_ERROR,
  PRODUCT_QUERY_LIMIT_MIN_ERROR,
  PRODUCT_QUERY_LIMIT_NUMBER_ERROR,
  PRODUCT_QUERY_MATERIAL_ARRAY_ERROR,
  PRODUCT_QUERY_MATERIAL_STRING_ERROR,
  PRODUCT_QUERY_PAGE_MIN_ERROR,
  PRODUCT_QUERY_PAGE_NUMBER_ERROR,
  PRODUCT_QUERY_PRICE_ARRAY_ERROR,
  PRODUCT_QUERY_PRICE_MAX_SIZE_ERROR,
  PRODUCT_QUERY_PRICE_NUMBER_ERROR,
  PRODUCT_QUERY_SEARCH_STRING_ERROR,
  PRODUCT_QUERY_SIZE_ARRAY_ERROR,
  PRODUCT_QUERY_SIZE_NUMBER_ERROR,
  PRODUCT_QUERY_SORT_ERROR,
} from '../products.constants'
import { PRODUCT_SORT_OPTIONS } from '../products.types'

export class FindAllProductsDto {
  @ProductsQueryIdsPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toStringArrayQueryParam(value))
  @IsArray({ message: PRODUCT_QUERY_IDS_ARRAY_ERROR })
  @IsMongoId({ each: true, message: PRODUCT_QUERY_IDS_FORMAT_ERROR })
  @ArrayUnique()
  ids?: string[]

  @ProductsQueryExcludeIdsPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toStringArrayQueryParam(value))
  @IsArray({ message: PRODUCT_QUERY_IDS_ARRAY_ERROR })
  @IsMongoId({ each: true, message: PRODUCT_QUERY_IDS_FORMAT_ERROR })
  @ArrayUnique()
  excludeIds?: string[]

  @ProductsQuerySizePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toNumberArrayQueryParam(value))
  @IsArray({ message: PRODUCT_QUERY_SIZE_ARRAY_ERROR })
  @IsInt({ each: true, message: PRODUCT_QUERY_SIZE_NUMBER_ERROR })
  @ArrayUnique()
  size?: number[]

  @ProductsQueryPricePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toNumberArrayQueryParam(value))
  @IsArray({ message: PRODUCT_QUERY_PRICE_ARRAY_ERROR })
  @IsInt({ each: true, message: PRODUCT_QUERY_PRICE_NUMBER_ERROR })
  @ArrayMaxSize(2, { message: PRODUCT_QUERY_PRICE_MAX_SIZE_ERROR })
  price?: number[]

  @ProductsQueryColorNamePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toStringArrayQueryParam(value))
  @IsArray({ message: PRODUCT_QUERY_COLOR_NAME_ARRAY_ERROR })
  @IsString({ each: true, message: PRODUCT_QUERY_COLOR_NAME_STRING_ERROR })
  @ArrayUnique()
  colorName?: string[]

  @ProductsQueryCategoryPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toStringArrayQueryParam(value))
  @IsArray({ message: PRODUCT_QUERY_CATEGORY_ARRAY_ERROR })
  @IsMongoId({ each: true, message: PRODUCT_QUERY_CATEGORY_FORMAT_ERROR })
  @ArrayUnique()
  category?: string[]

  @ProductsQueryMaterialPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toStringArrayQueryParam(value))
  @IsArray({ message: PRODUCT_QUERY_MATERIAL_ARRAY_ERROR })
  @IsString({ each: true, message: PRODUCT_QUERY_MATERIAL_STRING_ERROR })
  @ArrayUnique()
  material?: string[]

  @ProductsQueryIsHitPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toBooleanQueryParam(value))
  @IsBoolean({ message: PRODUCT_QUERY_IS_HIT_BOOLEAN_ERROR })
  isHit?: boolean

  @ProductsQueryIsNewArrivalPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toBooleanQueryParam(value))
  @IsBoolean({ message: PRODUCT_QUERY_IS_NEW_ARRIVAL_BOOLEAN_ERROR })
  isNewArrival?: boolean

  @ProductsQueryHasDiscountPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toBooleanQueryParam(value))
  @IsBoolean({ message: PRODUCT_QUERY_HAS_DISCOUNT_BOOLEAN_ERROR })
  hasDiscount?: boolean

  @ProductsQuerySearchPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: PRODUCT_QUERY_SEARCH_STRING_ERROR })
  search?: string

  @ProductsQueryLimitPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: PRODUCT_QUERY_LIMIT_NUMBER_ERROR })
  @Min(1, { message: PRODUCT_QUERY_LIMIT_MIN_ERROR })
  @Max(100, { message: PRODUCT_QUERY_LIMIT_MAX_ERROR })
  limit?: number

  @ProductsQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: PRODUCT_QUERY_PAGE_NUMBER_ERROR })
  @Min(1, { message: PRODUCT_QUERY_PAGE_MIN_ERROR })
  page?: number

  @ProductsQuerySortPropertyDocs()
  @IsOptional()
  @IsEnum(PRODUCT_SORT_OPTIONS, { message: PRODUCT_QUERY_SORT_ERROR })
  sort?: PRODUCT_SORT_OPTIONS
}
