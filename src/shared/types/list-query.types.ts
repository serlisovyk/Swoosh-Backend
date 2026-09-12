import { SortMap } from './sort.types'

export const CREATED_AT_SORT_OPTIONS = {
  NEWEST: 'NEWEST',
  OLDEST: 'OLDEST',
} as const

export type CREATED_AT_SORT_OPTIONS =
  (typeof CREATED_AT_SORT_OPTIONS)[keyof typeof CREATED_AT_SORT_OPTIONS]

export interface ResolveListQueryOptionsParams<
  TSort extends string = CREATED_AT_SORT_OPTIONS,
> {
  page?: number
  limit?: number
  sort?: TSort
  sortMap: Record<TSort, SortMap>
  defaultSort: TSort
  defaultLimit: number
}

export interface ResolvedListQueryOptions {
  skip: number
  limit: number
  sort: SortMap
}
