import { createContainsRegex, resolveListQueryOptions } from '@shared/utils'
import { CREATED_AT_SORT_MAP } from '@shared/constants'
import { CREATED_AT_SORT_OPTIONS } from '@shared/types'
import { FindAllIndividualOrdersDto } from './dto/find-all-individual-orders.dto'
import { DEFAULT_INDIVIDUAL_ORDERS_LIMIT } from './individual-order.constants'
import type { IndividualOrderListQueryOptions } from './individual-order.types'

export function buildIndividualOrderListQueryOptions(
  dto: FindAllIndividualOrdersDto,
): IndividualOrderListQueryOptions {
  const { limit, page, search, sort, status } = dto

  const filters: Record<string, unknown> = {}

  if (status) {
    filters.status = status
  }

  if (search) {
    const regex = createContainsRegex(search)

    filters.$or = [{ name: regex }, { email: regex }, { phone: regex }]
  }

  const {
    skip,
    limit: limitOption,
    sort: sortOption,
  } = resolveListQueryOptions({
    page,
    limit,
    sort,
    sortMap: CREATED_AT_SORT_MAP,
    defaultSort: CREATED_AT_SORT_OPTIONS.NEWEST,
    defaultLimit: DEFAULT_INDIVIDUAL_ORDERS_LIMIT,
  })

  return {
    filters,
    limit: limitOption,
    sort: sortOption,
    skip,
  }
}
