import { PartialType } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'
import { CreateIndividualOrderDto } from './create-individual-order.dto'
import { IndividualOrderStatusPropertyDocs } from '../individual-order.swagger'
import { INDIVIDUAL_ORDER_STATUS_ERROR } from '../individual-order.constants'
import { INDIVIDUAL_ORDER_STATUSES } from '../individual-order.types'

export class UpdateIndividualOrderDto extends PartialType(
  CreateIndividualOrderDto,
) {
  @IndividualOrderStatusPropertyDocs()
  @IsOptional()
  @IsEnum(INDIVIDUAL_ORDER_STATUSES, {
    message: INDIVIDUAL_ORDER_STATUS_ERROR,
  })
  status?: INDIVIDUAL_ORDER_STATUSES
}
