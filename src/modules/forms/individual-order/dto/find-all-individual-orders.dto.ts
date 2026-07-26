import { Transform, Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { trimStringValue } from '@shared/utils'
import {
  IndividualOrderQueryLimitPropertyDocs,
  IndividualOrderQueryPagePropertyDocs,
  IndividualOrderQuerySearchPropertyDocs,
  IndividualOrderQuerySortPropertyDocs,
  IndividualOrderQueryStatusPropertyDocs,
} from '../individual-order.swagger'
import {
  INDIVIDUAL_ORDER_LIMIT_MAX_ERROR,
  INDIVIDUAL_ORDER_LIMIT_MIN_ERROR,
  INDIVIDUAL_ORDER_LIMIT_NUMBER_ERROR,
  INDIVIDUAL_ORDER_PAGE_MIN_ERROR,
  INDIVIDUAL_ORDER_PAGE_NUMBER_ERROR,
  INDIVIDUAL_ORDER_SEARCH_STRING_ERROR,
  INDIVIDUAL_ORDER_SORT_ERROR,
  INDIVIDUAL_ORDER_STATUS_ERROR,
  MAX_INDIVIDUAL_ORDERS_LIMIT,
} from '../individual-order.constants'
import {
  INDIVIDUAL_ORDER_SORT_OPTIONS,
  INDIVIDUAL_ORDER_STATUSES,
} from '../individual-order.types'

export class FindAllIndividualOrdersDto {
  @IndividualOrderQuerySearchPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: INDIVIDUAL_ORDER_SEARCH_STRING_ERROR })
  search?: string

  @IndividualOrderQueryStatusPropertyDocs()
  @IsOptional()
  @IsEnum(INDIVIDUAL_ORDER_STATUSES, {
    message: INDIVIDUAL_ORDER_STATUS_ERROR,
  })
  status?: INDIVIDUAL_ORDER_STATUSES

  @IndividualOrderQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: INDIVIDUAL_ORDER_PAGE_NUMBER_ERROR })
  @Min(1, { message: INDIVIDUAL_ORDER_PAGE_MIN_ERROR })
  page?: number

  @IndividualOrderQueryLimitPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: INDIVIDUAL_ORDER_LIMIT_NUMBER_ERROR })
  @Min(1, { message: INDIVIDUAL_ORDER_LIMIT_MIN_ERROR })
  @Max(MAX_INDIVIDUAL_ORDERS_LIMIT, {
    message: INDIVIDUAL_ORDER_LIMIT_MAX_ERROR,
  })
  limit?: number

  @IndividualOrderQuerySortPropertyDocs()
  @IsOptional()
  @IsEnum(INDIVIDUAL_ORDER_SORT_OPTIONS, {
    message: INDIVIDUAL_ORDER_SORT_ERROR,
  })
  sort?: INDIVIDUAL_ORDER_SORT_OPTIONS
}
