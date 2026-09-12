import {
  plainToInstance,
  Transform,
  TransformFnParams,
  Type,
} from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Matches,
  ValidateIf,
  validateSync,
} from 'class-validator'
import { NODE_ENV } from '@shared/constants'
import { parseCorsDomainsConfigValue } from '@shared/utils'

const DEV_DEFAULT_CORS_DOMAIN = 'http://localhost:3000'

export class AppEnv {
  @IsEnum(NODE_ENV)
  NODE_ENV!: NODE_ENV

  @IsString()
  @IsNotEmpty()
  APP_NAME!: string

  // require_tld: false — dev points these at http://localhost, which has no TLD.
  @IsUrl({ require_tld: false })
  CLIENT_URL!: string

  @IsUrl({ require_tld: false })
  SERVER_URL!: string

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  PORT!: number

  // Required outside development (schema-level, not just optional); defaults
  // to a local origin in dev so a fresh checkout still boots.
  @Transform(({ value, obj }: TransformFnParams) => {
    const corsDomainsValue = value as string | undefined
    const nodeEnv = (obj as Record<string, unknown>).NODE_ENV

    return (
      parseCorsDomainsConfigValue(corsDomainsValue) ??
      (nodeEnv === NODE_ENV.DEVELOPMENT ? [DEV_DEFAULT_CORS_DOMAIN] : undefined)
    )
  })
  // Elements are always strings by construction (split/trim in the
  // Transform above) — @IsArray alone is enough, an each-element check
  // would just duplicate the same "missing" error.
  @ValidateIf((env: AppEnv) => env.NODE_ENV === NODE_ENV.PRODUCTION)
  @IsArray({ message: 'CORS_DOMAINS is required outside development' })
  CORS_DOMAINS!: string[]

  @IsOptional()
  @IsString()
  COOKIE_DOMAIN?: string

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string

  @IsString()
  @IsNotEmpty()
  RESET_TOKEN_SECRET!: string

  @IsString()
  @IsNotEmpty()
  AUTH_DUMMY_PASSWORD_HASH!: string

  @IsString()
  @IsNotEmpty()
  CLOUDFLARE_TURNSTILE_SECRET_KEY!: string

  // Anything but literal 'true'/'false' (or unset) is passed through
  // untouched, so a typo fails @IsBoolean() below instead of silently
  // being treated as enabled.
  @Transform(({ value }: TransformFnParams) => {
    const swaggerEnabledValue = value as string | undefined

    if (swaggerEnabledValue === undefined) return true
    if (swaggerEnabledValue === 'true') return true
    if (swaggerEnabledValue === 'false') return false

    return swaggerEnabledValue
  })
  @IsBoolean()
  SWAGGER_ENABLED!: boolean

  @IsOptional()
  @IsString()
  SWAGGER_USER?: string

  @IsOptional()
  @IsString()
  SWAGGER_PASSWORD?: string

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_EXPIRES_IN!: string

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_EXPIRES_IN!: string

  @IsString()
  @Matches(/^mongodb(\+srv)?:\/\//, {
    message:
      'MONGO_URI must be a mongodb:// or mongodb+srv:// connection string',
  })
  MONGO_URI!: string

  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY!: string

  @IsEmail()
  EMAIL_SENDER!: string

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_TTL!: number

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_LIMIT!: number
}

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const validatedEnv = plainToInstance(AppEnv, config, {
    enableImplicitConversion: false,
  })

  const errors = validateSync(validatedEnv, { skipMissingProperties: false })

  if (errors.length > 0) {
    const issues = errors
      .flatMap((error) => Object.values(error.constraints ?? {}))
      .map((message) => `  - ${message}`)
      .join('\n')

    throw new Error(`Invalid environment configuration:\n${issues}`)
  }

  return validatedEnv
}
