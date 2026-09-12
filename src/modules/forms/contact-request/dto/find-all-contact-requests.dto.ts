import { IsEnum, IsOptional } from 'class-validator'
import { ListQueryDto } from '@shared/dto'
import { CREATED_AT_SORT_OPTIONS } from '@shared/types'
import {
  ContactRequestQueryLimitPropertyDocs,
  ContactRequestQuerySearchPropertyDocs,
  ContactRequestQuerySortPropertyDocs,
} from '../contact-request.swagger'

export class FindAllContactRequestsDto extends ListQueryDto {
  @ContactRequestQuerySearchPropertyDocs()
  declare search?: string

  @ContactRequestQueryLimitPropertyDocs()
  declare limit?: number

  @ContactRequestQuerySortPropertyDocs()
  @IsOptional()
  @IsEnum(CREATED_AT_SORT_OPTIONS, {
    message: 'Некорректное значение сортировки',
  })
  sort?: CREATED_AT_SORT_OPTIONS
}
