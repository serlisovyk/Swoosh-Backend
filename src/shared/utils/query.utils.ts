export function toStringArrayQueryParam(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined

  const values = (Array.isArray(value) ? value : [value])
    .map((item) => String(item))
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean)

  return values.length ? values : undefined
}

export function toNumberArrayQueryParam(value: unknown): number[] | undefined {
  const values = toStringArrayQueryParam(value)

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
