import { Transform, Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { trimStringValue } from '@shared/utils'
import {
  MAX_NEWSLETTER_SUBSCRIPTIONS_LIMIT,
  NEWSLETTER_SUBSCRIPTION_LIMIT_MAX_ERROR,
  NEWSLETTER_SUBSCRIPTION_LIMIT_MIN_ERROR,
  NEWSLETTER_SUBSCRIPTION_LIMIT_NUMBER_ERROR,
  NEWSLETTER_SUBSCRIPTION_PAGE_MIN_ERROR,
  NEWSLETTER_SUBSCRIPTION_PAGE_NUMBER_ERROR,
  NEWSLETTER_SUBSCRIPTION_SEARCH_STRING_ERROR,
  NEWSLETTER_SUBSCRIPTION_SORT_ERROR,
} from '../newsletter-subscription.constants'
import {
  NewsletterSubscriptionQueryLimitPropertyDocs,
  NewsletterSubscriptionQueryPagePropertyDocs,
  NewsletterSubscriptionQuerySearchPropertyDocs,
  NewsletterSubscriptionQuerySortPropertyDocs,
} from '../newsletter-subscription.swagger'
import { NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS } from '../newsletter-subscription.types'

export class FindAllNewsletterSubscriptionsDto {
  @NewsletterSubscriptionQuerySearchPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: NEWSLETTER_SUBSCRIPTION_SEARCH_STRING_ERROR })
  search?: string

  @NewsletterSubscriptionQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: NEWSLETTER_SUBSCRIPTION_PAGE_NUMBER_ERROR })
  @Min(1, { message: NEWSLETTER_SUBSCRIPTION_PAGE_MIN_ERROR })
  page?: number

  @NewsletterSubscriptionQueryLimitPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: NEWSLETTER_SUBSCRIPTION_LIMIT_NUMBER_ERROR })
  @Min(1, { message: NEWSLETTER_SUBSCRIPTION_LIMIT_MIN_ERROR })
  @Max(MAX_NEWSLETTER_SUBSCRIPTIONS_LIMIT, {
    message: NEWSLETTER_SUBSCRIPTION_LIMIT_MAX_ERROR,
  })
  limit?: number

  @NewsletterSubscriptionQuerySortPropertyDocs()
  @IsOptional()
  @IsEnum(NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS, {
    message: NEWSLETTER_SUBSCRIPTION_SORT_ERROR,
  })
  sort?: NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS
}
