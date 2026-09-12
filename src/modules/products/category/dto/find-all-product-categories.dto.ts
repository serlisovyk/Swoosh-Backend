import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import {
  PRODUCT_CATEGORY_MAX_LIMIT,
  PRODUCT_CATEGORY_QUERY_LIMIT_MAX_ERROR,
} from '../product-category.constants'
import {
  ProductCategoryQueryLimitPropertyDocs,
  ProductCategoryQueryPagePropertyDocs,
} from '../product-category.swagger'

export class FindAllProductCategoriesDto {
  @ProductCategoryQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Страница должна быть числом' })
  @Min(1, { message: 'Страница должна быть не меньше 1' })
  page?: number

  @ProductCategoryQueryLimitPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть числом' })
  @Min(1, { message: 'Лимит должен быть не меньше 1' })
  @Max(PRODUCT_CATEGORY_MAX_LIMIT, {
    message: PRODUCT_CATEGORY_QUERY_LIMIT_MAX_ERROR,
  })
  limit?: number
}
