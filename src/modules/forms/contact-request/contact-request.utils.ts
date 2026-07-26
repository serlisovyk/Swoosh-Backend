import {
  CONTACT_REQUEST_SORT_MAP,
  DEFAULT_CONTACT_REQUESTS_LIMIT,
  REGEX_SPECIAL_CHARACTERS,
} from './contact-request.constants'
import { FindAllContactRequestsDto } from './dto/find-all-contact-requests.dto'
import {
  CONTACT_REQUEST_SORT_OPTIONS,
  type ContactRequestListQueryOptions,
} from './contact-request.types'

export function buildContactRequestListQueryOptions(
  dto: FindAllContactRequestsDto,
): ContactRequestListQueryOptions {
  const { limit, page, search, sort } = dto

  const filters: Record<string, unknown> = {}

  if (search) {
    const regex = createContainsRegex(search)

    filters.$or = [{ name: regex }, { email: regex }, { message: regex }]
  }

  const limitOption = limit ?? DEFAULT_CONTACT_REQUESTS_LIMIT

  const sortOption = sort
    ? CONTACT_REQUEST_SORT_MAP[sort]
    : CONTACT_REQUEST_SORT_MAP[CONTACT_REQUEST_SORT_OPTIONS.NEWEST]

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
