import { Transform, Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import {
  LIST_QUERY_LIMIT_MAX_ERROR,
  LIST_QUERY_LIMIT_MIN_ERROR,
  LIST_QUERY_LIMIT_NUMBER_ERROR,
  LIST_QUERY_MAX_LIMIT,
  LIST_QUERY_PAGE_MIN_ERROR,
  LIST_QUERY_PAGE_NUMBER_ERROR,
  LIST_QUERY_SEARCH_STRING_ERROR,
} from '@shared/constants'
import { ListQueryPagePropertyDocs } from '@shared/swagger'
import { trimStringValue } from '@shared/utils'

export class ListQueryDto {
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: LIST_QUERY_SEARCH_STRING_ERROR })
  search?: string

  @ListQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: LIST_QUERY_PAGE_NUMBER_ERROR })
  @Min(1, { message: LIST_QUERY_PAGE_MIN_ERROR })
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: LIST_QUERY_LIMIT_NUMBER_ERROR })
  @Min(1, { message: LIST_QUERY_LIMIT_MIN_ERROR })
  @Max(LIST_QUERY_MAX_LIMIT, { message: LIST_QUERY_LIMIT_MAX_ERROR })
  limit?: number
}
