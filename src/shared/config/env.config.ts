import { z } from 'zod'
import { NODE_ENV } from '@shared/constants'
import { parseCorsDomainsConfigValue } from '@shared/utils'

const DEV_DEFAULT_CORS_DOMAIN = 'http://localhost:3000'

const rawEnvSchema = z.object({
  NODE_ENV: z.enum([NODE_ENV.DEVELOPMENT, NODE_ENV.PRODUCTION]),

  APP_NAME: z.string().min(1),

  CLIENT_URL: z.url(),
  SERVER_URL: z.url(),

  PORT: z.coerce.number().int().positive(),

  CORS_DOMAINS: z.string().min(1).optional(),

  COOKIE_DOMAIN: z.string().min(1).optional(),

  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  RESET_TOKEN_SECRET: z.string().min(1),
  AUTH_DUMMY_PASSWORD_HASH: z.string().min(1),

  CLOUDFLARE_TURNSTILE_SECRET_KEY: z.string().min(1),

  SWAGGER_ENABLED: z.enum(['true', 'false']).default('true'),
  SWAGGER_USER: z.string().min(1).optional(),
  SWAGGER_PASSWORD: z.string().min(1).optional(),

  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().min(1),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().min(1),

  MONGO_URI: z.string().regex(/^mongodb(\+srv)?:\/\//, {
    message: 'must be a mongodb:// or mongodb+srv:// connection string',
  }),

  RESEND_API_KEY: z.string().min(1),
  EMAIL_SENDER: z.email(),

  THROTTLE_TTL: z.coerce.number().int().positive(),
  THROTTLE_LIMIT: z.coerce.number().int().positive(),
})

const envSchema = rawEnvSchema
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === NODE_ENV.PRODUCTION && !value.CORS_DOMAINS) {
      ctx.addIssue({
        code: 'custom',
        path: ['CORS_DOMAINS'],
        message: 'required outside development',
      })
    }
  })
  .transform((value) => {
    const corsDomains =
      parseCorsDomainsConfigValue(value.CORS_DOMAINS) ??
      (value.NODE_ENV === NODE_ENV.DEVELOPMENT ? [DEV_DEFAULT_CORS_DOMAIN] : [])

    return {
      ...value,
      CORS_DOMAINS: corsDomains,
      SWAGGER_ENABLED: value.SWAGGER_ENABLED === 'true',
    }
  })

export type AppEnv = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    throw new Error(`Invalid environment configuration:\n${issues}`)
  }

  return result.data
}
