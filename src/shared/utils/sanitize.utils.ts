export function trimStringValue(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value
}

export function trimStringArrayValue(value: unknown): unknown {
  if (!Array.isArray(value)) return value

  return value.map((item: unknown) => trimStringValue(item))
}

export function normalizeEmailValue(value: unknown): unknown {
  const trimmedValue = trimStringValue(value)

  return typeof trimmedValue === 'string'
    ? trimmedValue.toLowerCase()
    : trimmedValue
}

export function normalizePhoneValue(value: unknown): unknown {
  if (typeof value !== 'string') return value

  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  const digits = trimmedValue.replace(/\D/g, '')
  if (!digits) return trimmedValue

  const hasLeadingPlus = trimmedValue.startsWith('+')

  return hasLeadingPlus ? `+${digits}` : digits
}
