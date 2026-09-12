import type {
  ResolveListQueryOptionsParams,
  ResolvedListQueryOptions,
} from '@shared/types'
import { resolvePaginationOffset } from './pagination.utils'

export function resolveListQueryOptions<TSort extends string>({
  page,
  limit,
  sort,
  sortMap,
  defaultSort,
  defaultLimit,
}: ResolveListQueryOptionsParams<TSort>): ResolvedListQueryOptions {
  const limitOption = limit ?? defaultLimit

  return {
    skip: resolvePaginationOffset(page, limitOption),
    limit: limitOption,
    sort: sortMap[sort ?? defaultSort],
  }
}
