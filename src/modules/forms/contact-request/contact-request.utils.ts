import { createContainsRegex, resolveListQueryOptions } from '@shared/utils'
import { CREATED_AT_SORT_MAP } from '@shared/constants'
import { CREATED_AT_SORT_OPTIONS } from '@shared/types'
import { DEFAULT_CONTACT_REQUESTS_LIMIT } from './contact-request.constants'
import { FindAllContactRequestsDto } from './dto/find-all-contact-requests.dto'
import type { ContactRequestListQueryOptions } from './contact-request.types'

export function buildContactRequestListQueryOptions(
  dto: FindAllContactRequestsDto,
): ContactRequestListQueryOptions {
  const { limit, page, search, sort } = dto

  const filters: Record<string, unknown> = {}

  if (search) {
    const regex = createContainsRegex(search)

    filters.$or = [{ name: regex }, { email: regex }, { message: regex }]
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
    defaultLimit: DEFAULT_CONTACT_REQUESTS_LIMIT,
  })

  return {
    filters,
    limit: limitOption,
    sort: sortOption,
    skip,
  }
}
