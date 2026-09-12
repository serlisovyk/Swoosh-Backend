import { IsEnum, IsOptional } from 'class-validator'
import { ListQueryDto } from '@shared/dto'
import { CREATED_AT_SORT_OPTIONS } from '@shared/types'
import { NEWSLETTER_SUBSCRIPTION_SORT_ERROR } from '../newsletter-subscription.constants'
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
    message: NEWSLETTER_SUBSCRIPTION_SORT_ERROR,
  })
  sort?: CREATED_AT_SORT_OPTIONS
}
