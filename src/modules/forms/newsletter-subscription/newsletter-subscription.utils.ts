import { FindAllNewsletterSubscriptionsDto } from './dto/find-all-newsletter-subscriptions.dto'
import {
  DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT,
  NEWSLETTER_SUBSCRIPTION_SORT_MAP,
  REGEX_SPECIAL_CHARACTERS,
} from './newsletter-subscription.constants'
import {
  type NewsletterSubscriptionListQueryOptions,
  NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS,
} from './newsletter-subscription.types'

export function buildNewsletterSubscriptionListQueryOptions(
  dto: FindAllNewsletterSubscriptionsDto,
): NewsletterSubscriptionListQueryOptions {
  const { limit, page, search, sort } = dto

  const filters: Record<string, unknown> = {}

  if (search) {
    filters.email = createContainsRegex(search)
  }

  const limitOption = limit ?? DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT

  const sortOption = sort
    ? NEWSLETTER_SUBSCRIPTION_SORT_MAP[sort]
    : NEWSLETTER_SUBSCRIPTION_SORT_MAP[
        NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS.NEWEST
      ]

  const skip = ((page ?? 1) - 1) * limitOption

  return {
    filters,
    limit: limitOption,
    sort: sortOption,
    skip,
  }
}

function createContainsRegex(value: string): RegExp {
  return new RegExp(escapeRegExp(value), 'i')
}

function escapeRegExp(value: string): string {
  return value.replace(REGEX_SPECIAL_CHARACTERS, '\\$&')
}
