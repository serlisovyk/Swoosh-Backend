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
  MAX_PRODUCTS_LIMIT,
  PRODUCT_QUERY_IDS_ARRAY_ERROR,
  PRODUCT_QUERY_IDS_FORMAT_ERROR,
  PRODUCT_QUERY_LIMIT_MAX_ERROR,
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
  @IsArray({ message: 'Фильтр размера должен быть массивом' })
  @IsInt({ each: true, message: 'Фильтр размера должен содержать числа' })
  @ArrayUnique()
  size?: number[]

  @ProductsQueryPricePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toNumberArrayQueryParam(value))
  @IsArray({ message: 'Фильтр цены должен быть массивом' })
  @IsInt({ each: true, message: 'Фильтр цены должен содержать числа' })
  @ArrayMaxSize(2, {
    message: 'Фильтр цены может содержать не более двух значений',
  })
  price?: number[]

  @ProductsQueryColorNamePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toStringArrayQueryParam(value))
  @IsArray({ message: 'Фильтр цвета должен быть массивом' })
  @IsString({ each: true, message: 'Фильтр цвета должен содержать строки' })
  @ArrayUnique()
  colorName?: string[]

  @ProductsQueryCategoryPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toStringArrayQueryParam(value))
  @IsArray({ message: 'Фильтр категории должен быть массивом' })
  @IsMongoId({
    each: true,
    message: 'Фильтр категории должен содержать валидные MongoDB ObjectId',
  })
  @ArrayUnique()
  category?: string[]

  @ProductsQueryMaterialPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toStringArrayQueryParam(value))
  @IsArray({ message: 'Фильтр материала должен быть массивом' })
  @IsString({ each: true, message: 'Фильтр материала должен содержать строки' })
  @ArrayUnique()
  material?: string[]

  @ProductsQueryIsHitPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toBooleanQueryParam(value))
  @IsBoolean({ message: 'Фильтр isHit должен быть булевым значением' })
  isHit?: boolean

  @ProductsQueryIsNewArrivalPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toBooleanQueryParam(value))
  @IsBoolean({ message: 'Фильтр isNewArrival должен быть булевым значением' })
  isNewArrival?: boolean

  @ProductsQueryHasDiscountPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => toBooleanQueryParam(value))
  @IsBoolean({ message: 'Фильтр hasDiscount должен быть булевым значением' })
  hasDiscount?: boolean

  @ProductsQuerySearchPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Поисковый запрос должен быть строкой' })
  search?: string

  @ProductsQueryLimitPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть числом' })
  @Min(1, { message: 'Лимит должен быть не меньше 1' })
  @Max(MAX_PRODUCTS_LIMIT, { message: PRODUCT_QUERY_LIMIT_MAX_ERROR })
  limit?: number

  @ProductsQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Страница должна быть числом' })
  @Min(1, { message: 'Страница должна быть не меньше 1' })
  page?: number

  @ProductsQuerySortPropertyDocs()
  @IsOptional()
  @IsEnum(PRODUCT_SORT_OPTIONS, { message: 'Некорректное значение сортировки' })
  sort?: PRODUCT_SORT_OPTIONS
}
