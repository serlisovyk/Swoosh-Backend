import { CREATED_AT_SORT_OPTIONS, SortMap } from '@shared/types'

export const DEFAULT_PAGE_NUMBER = 1

export const LIST_QUERY_MAX_LIMIT = 100

export const CREATED_AT_SORT_MAP: Record<CREATED_AT_SORT_OPTIONS, SortMap> = {
  [CREATED_AT_SORT_OPTIONS.NEWEST]: { createdAt: -1 },
  [CREATED_AT_SORT_OPTIONS.OLDEST]: { createdAt: 1 },
}
