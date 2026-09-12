import { createContainsRegex, resolveListQueryOptions } from '@shared/utils'
import { CREATED_AT_SORT_MAP } from '@shared/constants'
import { CREATED_AT_SORT_OPTIONS } from '@shared/types'
import { FindAllNewsletterSubscriptionsDto } from './dto/find-all-newsletter-subscriptions.dto'
import { DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT } from './newsletter-subscription.constants'
import type { NewsletterSubscriptionListQueryOptions } from './newsletter-subscription.types'

export function buildNewsletterSubscriptionListQueryOptions(
  dto: FindAllNewsletterSubscriptionsDto,
): NewsletterSubscriptionListQueryOptions {
  const { limit, page, search, sort } = dto

  const filters: Record<string, unknown> = {}

  if (search) {
    filters.email = createContainsRegex(search)
  }

  const {
    skip,
    limit: limitOption,
    sort: sortOption,
  } = resolveListQueryOptions({
    page,
    limit,
    sort,
    sortMap: CREATED_AT_SORT_MAP,
    defaultSort: CREATED_AT_SORT_OPTIONS.NEWEST,
    defaultLimit: DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT,
  })

  return {
    filters,
    limit: limitOption,
    sort: sortOption,
    skip,
  }
}
