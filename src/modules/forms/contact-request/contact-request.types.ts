import { Model } from 'mongoose'
import { ContactRequest } from './models/contact-request.model'

export type ContactRequestModel = Model<ContactRequest>

export interface ContactRequestListQueryOptions {
  filters: Record<string, unknown>
  limit: number
  skip: number
  sort: Record<string, 1 | -1>
}

export interface ContactRequestListResponse {
  contactRequests: ContactRequest[]
  total: number
}
