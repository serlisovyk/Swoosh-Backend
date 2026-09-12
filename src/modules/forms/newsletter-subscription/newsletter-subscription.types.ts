import { Model } from 'mongoose'
import { SortMap } from '@shared/types'
import { NewsletterSubscription } from './models/newsletter-subscription.model'

export type NewsletterSubscriptionModel = Model<NewsletterSubscription>

export interface NewsletterSubscriptionListQueryOptions {
  filters: Record<string, unknown>
  limit: number
  skip: number
  sort: SortMap
}

export interface NewsletterSubscriptionListResponse {
  newsletterSubscriptions: NewsletterSubscription[]
  total: number
}
