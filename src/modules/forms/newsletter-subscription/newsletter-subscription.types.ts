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
