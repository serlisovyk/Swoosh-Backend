import { Model } from 'mongoose'
import { IndividualOrder } from './models/individual-order.model'

export type IndividualOrderModel = Model<IndividualOrder>

export interface IndividualOrderListQueryOptions {
  filters: Record<string, unknown>
  limit: number
  skip: number
  sort: Record<string, 1 | -1>
}

export interface IndividualOrderListResponse {
  individualOrders: IndividualOrder[]
  total: number
}

export const INDIVIDUAL_ORDER_STATUSES = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  CONTACTED: 'CONTACTED',
  COMPLETED: 'COMPLETED',
  SPAM: 'SPAM',
  ARCHIVED: 'ARCHIVED',
} as const

export type INDIVIDUAL_ORDER_STATUSES =
  (typeof INDIVIDUAL_ORDER_STATUSES)[keyof typeof INDIVIDUAL_ORDER_STATUSES]

export const INDIVIDUAL_ORDER_SORT_OPTIONS = {
  NEWEST: 'NEWEST',
  OLDEST: 'OLDEST',
} as const

export type INDIVIDUAL_ORDER_SORT_OPTIONS =
  (typeof INDIVIDUAL_ORDER_SORT_OPTIONS)[keyof typeof INDIVIDUAL_ORDER_SORT_OPTIONS]
