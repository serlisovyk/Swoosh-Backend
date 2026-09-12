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
  sortMap: Record<TSort, Record<string, 1 | -1>>
  defaultSort: TSort
  defaultLimit: number
}

export interface ResolvedListQueryOptions {
  skip: number
  limit: number
  sort: Record<string, 1 | -1>
}
