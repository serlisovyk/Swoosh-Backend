import { Model } from 'mongoose'
import { SortMap } from '@shared/types'
import { ContactRequest } from './models/contact-request.model'

export type ContactRequestModel = Model<ContactRequest>

export interface ContactRequestListQueryOptions {
  filters: Record<string, unknown>
  limit: number
  skip: number
  sort: SortMap
}

export interface ContactRequestListResponse {
  contactRequests: ContactRequest[]
  total: number
}
