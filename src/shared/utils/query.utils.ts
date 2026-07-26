export function toStringArrayQueryParam(value: unknown): string[] | undefined {
  return toQueryArray(value)
}

export function toNumberArrayQueryParam(value: unknown): number[] | undefined {
  const values = toQueryArray(value)

  return values?.map((item) => Number(item))
}

export function toBooleanQueryParam(value: unknown): unknown {
  if (typeof value === 'boolean') return value

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase()

    if (normalizedValue === 'true') return true
    if (normalizedValue === 'false') return false
  }

  return value
}

function toQueryArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined

  const values = (Array.isArray(value) ? value : [value])
    .map((item) => String(item))
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean)

  return values.length ? values : undefined
}

export function trimStringValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value
}

export function normalizeEmailValue(value: unknown): unknown {
  const trimmedValue = trimStringValue(value)

  return typeof trimmedValue === 'string'
    ? trimmedValue.toLowerCase()
    : trimmedValue
}

export function trimStringArrayValue(value: unknown): unknown {
  if (!Array.isArray(value)) return value

  return value.map((item: unknown) => trimStringValue(item))
}
