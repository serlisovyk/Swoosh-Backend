export const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g

export function escapeRegExp(value: string): string {
  return value.replace(REGEX_SPECIAL_CHARACTERS, '\\$&')
}

export function createContainsRegex(value: string): RegExp {
  return new RegExp(escapeRegExp(value), 'i')
}

export function createExactRegex(value: string): RegExp {
  return new RegExp(`^${escapeRegExp(value)}$`, 'i')
}
