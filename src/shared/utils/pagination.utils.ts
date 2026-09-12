import { DEFAULT_PAGE_NUMBER } from '@shared/constants'

export function resolvePaginationOffset(
  page: number | undefined,
  limit: number,
): number {
  return ((page ?? DEFAULT_PAGE_NUMBER) - 1) * limit
}
