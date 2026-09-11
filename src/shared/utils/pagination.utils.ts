export const DEFAULT_PAGE = 1

export function resolvePaginationOffset(
  page: number | undefined,
  limit: number,
): number {
  return ((page ?? DEFAULT_PAGE) - 1) * limit
}
