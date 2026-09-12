import { ValidationError } from 'class-validator'

export function collectConstraintMessages(errors: ValidationError[]): string[] {
  const messages: string[] = []

  for (const error of errors) {
    messages.push(...Object.values(error.constraints ?? {}))
    messages.push(...collectConstraintMessages(error.children ?? []))
  }

  return messages
}
