import { Model } from 'mongoose'
import { NewsletterSubscription } from './models/newsletter-subscription.model'

export type NewsletterSubscriptionModel = Model<NewsletterSubscription>

export interface NewsletterSubscriptionListQueryOptions {
  filters: Record<string, unknown>
  limit: number
  skip: number
  sort: Record<string, 1 | -1>
}

export interface NewsletterSubscriptionListResponse {
  newsletterSubscriptions: NewsletterSubscription[]
  total: number
}

export const NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS = {
  NEWEST: 'NEWEST',
  OLDEST: 'OLDEST',
} as const

export type NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS =
  (typeof NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS)[keyof typeof NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS]
