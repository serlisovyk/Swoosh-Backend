import { FindAllIndividualOrdersDto } from './dto/find-all-individual-orders.dto'
import {
  DEFAULT_INDIVIDUAL_ORDERS_LIMIT,
  INDIVIDUAL_ORDER_SORT_MAP,
  REGEX_SPECIAL_CHARACTERS,
} from './individual-order.constants'
import {
  type IndividualOrderListQueryOptions,
  INDIVIDUAL_ORDER_SORT_OPTIONS,
} from './individual-order.types'

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

  const limitOption = limit ?? DEFAULT_INDIVIDUAL_ORDERS_LIMIT

  const sortOption = sort
    ? INDIVIDUAL_ORDER_SORT_MAP[sort]
    : INDIVIDUAL_ORDER_SORT_MAP[INDIVIDUAL_ORDER_SORT_OPTIONS.NEWEST]

  const skip = ((page ?? 1) - 1) * limitOption

  return {
    filters,
    limit: limitOption,
    sort: sortOption,
    skip,
  }
}

function createContainsRegex(value: string): RegExp {
  return new RegExp(escapeRegExp(value), 'i')
}

function escapeRegExp(value: string): string {
  return value.replace(REGEX_SPECIAL_CHARACTERS, '\\$&')
}
