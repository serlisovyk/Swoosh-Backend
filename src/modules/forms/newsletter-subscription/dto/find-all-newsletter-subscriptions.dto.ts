import { IsEnum, IsOptional } from 'class-validator'
import { ListQueryDto } from '@shared/dto'
import { CREATED_AT_SORT_OPTIONS } from '@shared/types'
import {
  NewsletterSubscriptionQueryLimitPropertyDocs,
  NewsletterSubscriptionQuerySearchPropertyDocs,
  NewsletterSubscriptionQuerySortPropertyDocs,
} from '../newsletter-subscription.swagger'

export class FindAllNewsletterSubscriptionsDto extends ListQueryDto {
  @NewsletterSubscriptionQuerySearchPropertyDocs()
  declare search?: string

  @NewsletterSubscriptionQueryLimitPropertyDocs()
  declare limit?: number

  @NewsletterSubscriptionQuerySortPropertyDocs()
  @IsOptional()
  @IsEnum(CREATED_AT_SORT_OPTIONS, {
    message: 'Некорректное значение сортировки',
  })
  sort?: CREATED_AT_SORT_OPTIONS
}
