export function normalizePhoneValue(value: unknown): unknown {
  if (typeof value !== 'string') return value

  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  const digits = trimmedValue.replace(/\D/g, '')
  if (!digits) return trimmedValue

  const hasLeadingPlus = trimmedValue.startsWith('+')

  return hasLeadingPlus ? `+${digits}` : digits
}
