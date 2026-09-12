import { toBooleanQueryParam } from '@shared/utils'

export function parseSwaggerEnabled(value: unknown) {
  if (value === undefined) return true

  return toBooleanQueryParam(value)
}
