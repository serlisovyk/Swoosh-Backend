import { CREATED_AT_SORT_OPTIONS } from '@shared/types'

export const LIST_QUERY_SEARCH_STRING_ERROR =
  'Поисковая строка должна быть строкой'
export const LIST_QUERY_PAGE_NUMBER_ERROR = 'Страница должна быть числом'
export const LIST_QUERY_PAGE_MIN_ERROR = 'Страница должна быть не меньше 1'
export const LIST_QUERY_LIMIT_NUMBER_ERROR = 'Лимит должен быть числом'
export const LIST_QUERY_LIMIT_MIN_ERROR = 'Лимит должен быть не меньше 1'
export const LIST_QUERY_LIMIT_MAX_ERROR = 'Лимит должен быть не больше 100'

export const LIST_QUERY_MAX_LIMIT = 100

export const CREATED_AT_SORT_MAP: Record<
  CREATED_AT_SORT_OPTIONS,
  Record<string, 1 | -1>
> = {
  [CREATED_AT_SORT_OPTIONS.NEWEST]: { createdAt: -1 },
  [CREATED_AT_SORT_OPTIONS.OLDEST]: { createdAt: 1 },
}
