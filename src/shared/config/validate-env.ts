import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { AppEnv } from './env.config'
import { groupEnvByDomain } from './group-env-by-domain.utils'
import { collectConstraintMessages } from './collect-constraint-messages.utils'

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const validatedEnv = plainToInstance(AppEnv, groupEnvByDomain(config), {
    enableImplicitConversion: false,
  })

  const issues = collectConstraintMessages(
    validateSync(validatedEnv, { skipMissingProperties: false }),
  )

  if (issues.length > 0) {
    const formattedIssues = issues.map((message) => `  - ${message}`).join('\n')

    throw new Error(`Invalid environment configuration:\n${formattedIssues}`)
  }

  return validatedEnv
}
