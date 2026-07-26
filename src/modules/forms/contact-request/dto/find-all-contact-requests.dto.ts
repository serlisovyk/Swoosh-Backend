import { Transform, Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { trimStringValue } from '@shared/utils'
import {
  CONTACT_REQUEST_LIMIT_MAX_ERROR,
  CONTACT_REQUEST_LIMIT_MIN_ERROR,
  CONTACT_REQUEST_LIMIT_NUMBER_ERROR,
  CONTACT_REQUEST_PAGE_MIN_ERROR,
  CONTACT_REQUEST_PAGE_NUMBER_ERROR,
  CONTACT_REQUEST_SEARCH_STRING_ERROR,
  CONTACT_REQUEST_SORT_ERROR,
  MAX_CONTACT_REQUESTS_LIMIT,
} from '../contact-request.constants'
import {
  ContactRequestQueryLimitPropertyDocs,
  ContactRequestQueryPagePropertyDocs,
  ContactRequestQuerySearchPropertyDocs,
  ContactRequestQuerySortPropertyDocs,
} from '../contact-request.swagger'
import { CONTACT_REQUEST_SORT_OPTIONS } from '../contact-request.types'

export class FindAllContactRequestsDto {
  @ContactRequestQuerySearchPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: CONTACT_REQUEST_SEARCH_STRING_ERROR })
  search?: string

  @ContactRequestQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: CONTACT_REQUEST_PAGE_NUMBER_ERROR })
  @Min(1, { message: CONTACT_REQUEST_PAGE_MIN_ERROR })
  page?: number

  @ContactRequestQueryLimitPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: CONTACT_REQUEST_LIMIT_NUMBER_ERROR })
  @Min(1, { message: CONTACT_REQUEST_LIMIT_MIN_ERROR })
  @Max(MAX_CONTACT_REQUESTS_LIMIT, {
    message: CONTACT_REQUEST_LIMIT_MAX_ERROR,
  })
  limit?: number

  @ContactRequestQuerySortPropertyDocs()
  @IsOptional()
  @IsEnum(CONTACT_REQUEST_SORT_OPTIONS, {
    message: CONTACT_REQUEST_SORT_ERROR,
  })
  sort?: CONTACT_REQUEST_SORT_OPTIONS
}
