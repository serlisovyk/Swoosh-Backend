import { IsEnum, IsOptional } from 'class-validator'
import { ListQueryDto } from '@shared/dto'
import { CREATED_AT_SORT_OPTIONS } from '@shared/types'
import { INDIVIDUAL_ORDER_STATUS_ERROR } from '../individual-order.constants'
import {
  IndividualOrderQueryLimitPropertyDocs,
  IndividualOrderQuerySearchPropertyDocs,
  IndividualOrderQuerySortPropertyDocs,
  IndividualOrderQueryStatusPropertyDocs,
} from '../individual-order.swagger'
import { INDIVIDUAL_ORDER_STATUSES } from '../individual-order.types'

export class FindAllIndividualOrdersDto extends ListQueryDto {
  @IndividualOrderQuerySearchPropertyDocs()
  declare search?: string

  @IndividualOrderQueryStatusPropertyDocs()
  @IsOptional()
  @IsEnum(INDIVIDUAL_ORDER_STATUSES, {
    message: INDIVIDUAL_ORDER_STATUS_ERROR,
  })
  status?: INDIVIDUAL_ORDER_STATUSES

  @IndividualOrderQueryLimitPropertyDocs()
  declare limit?: number

  @IndividualOrderQuerySortPropertyDocs()
  @IsOptional()
  @IsEnum(CREATED_AT_SORT_OPTIONS, {
    message: 'Некорректное значение сортировки',
  })
  sort?: CREATED_AT_SORT_OPTIONS
}
