# Plan: split AppEnv into domain groups, add getEnv()/getEnvOrThrow() helpers (MY-73)

No spec — behavior does not change (env var names, defaults, validation
outcomes, and startup crash conditions are identical; only the internal
`AppEnv` shape and the read-call syntax change). Plan only.

## Current shape

`src/shared/config/env.config.ts`'s `AppEnv` is one flat class, 22
`class-validator`-decorated fields across 8 domains. 15 files call
`configService.get('KEY', { infer: true })` / `.getOrThrow(...)` directly,
31 call sites total.

## Target shape

### `AppEnv` nested by domain

Eight nested classes, `@ValidateNested()` + `@Type(() => X)` on each `AppEnv`
field, one field per domain (field name = domain, lowercase):

- `AppConfig` (`app`): `NODE_ENV`, `APP_NAME`, `CLIENT_URL`, `SERVER_URL`, `PORT`
- `CorsConfig` (`cors`): `CORS_DOMAINS`, `COOKIE_DOMAIN`
- `JwtConfig` (`jwt`): `JWT_SECRET`, `JWT_REFRESH_SECRET`, `RESET_TOKEN_SECRET`, `AUTH_DUMMY_PASSWORD_HASH`, `JWT_ACCESS_TOKEN_EXPIRES_IN`, `JWT_REFRESH_TOKEN_EXPIRES_IN`
- `CaptchaConfig` (`captcha`): `CLOUDFLARE_TURNSTILE_SECRET_KEY`
- `SwaggerConfig` (`swagger`): `SWAGGER_ENABLED`, `SWAGGER_USER`, `SWAGGER_PASSWORD`
- `MongoConfig` (`mongo`): `MONGO_URI`
- `EmailConfig` (`email`): `RESEND_API_KEY`, `EMAIL_SENDER`
- `ThrottlerConfig` (`throttler`): `THROTTLE_TTL`, `THROTTLE_LIMIT`

22 fields, exhaustive, matches the issue's own domain list. Every field keeps
its original name, type, and decorators (`@IsEnum`, `@Type(() => Number)`,
etc.) verbatim — only which class it lives in changes. `@nestjs/config`'s
`ConfigService.get`/`getOrThrow` already resolve dot-paths at runtime via
`lodash.get` against the validated config object (confirmed by reading
`node_modules/@nestjs/config/dist/config.service.js`), and its `Path`/
`PathValue` generic types (exported from the package) give this full type
inference — so `configService.get('jwt.JWT_SECRET', { infer: true })` works
exactly like the old flat key, no framework gap to work around.

### The one field that doesn't nest cleanly: `CORS_DOMAINS`

Today, `CORS_DOMAINS` reads `NODE_ENV` (a **different** domain, `AppConfig`)
in both its `@Transform` (default to `http://localhost:3000` in dev) and its
`@ValidateIf` (required only outside dev). A nested class's own decorators
only see that class's own slice of the plain object — `CorsConfig`'s
`@Transform`/`@ValidateIf` cannot reach `AppConfig.NODE_ENV` without smuggling
a stray `NODE_ENV` copy onto the CORS slice (which `class-transformer` would
then carry through onto the resulting `CorsConfig` instance, polluting its
shape).

Resolution: move both computations out of decorators entirely.

- The default (`CORS_DOMAINS` unset + dev → `['http://localhost:3000']`) is
  computed in `groupEnvByDomain` (see below), which already has the full flat
  `config` object including `NODE_ENV`, before any class-transformer step
  runs. `CorsConfig.CORS_DOMAINS` becomes a plain `@IsOptional() @IsArray()`
  — by construction it is always already `string[] | undefined` by the time
  it reaches validation, so this can never actually fail; it stays as a
  defensive/documentation-level assertion, same spirit as the existing "not
  each-element checked" comment.
- The requiredness (`CORS_DOMAINS` missing + prod → startup error) becomes a
  manual check in `validateEnv()`, after per-domain validation, using the
  already-validated `validatedEnv.app.NODE_ENV` and
  `validatedEnv.cors.CORS_DOMAINS`. Same error message text
  (`'CORS_DOMAINS is required outside development'`), appended to the same
  aggregated issues list.

This is the only field whose validation *mechanism* changes; its default
value, its requiredness rule, and the exact error text are unchanged.

### `groupEnvByDomain(config)` — new, private to `env.config.ts`

Builds the nested plain object `plainToInstance(AppEnv, ...)` consumes:
one sub-object per domain, plucking the matching flat keys from the raw
`config: Record<string, unknown>` (what `ConfigModule.forRoot({ validate })`
hands `validateEnv`), plus the `CORS_DOMAINS` default described above.

### Error message flattening needs to recurse

The current `errors.flatMap((error) => Object.values(error.constraints ?? {}))`
only reads each top-level `ValidationError`'s own `.constraints` — correct for
a flat class, but with `@ValidateNested()`, a field-level constraint failure
inside e.g. `JwtConfig` shows up on the **nested** error's `.children`, not on
the top-level `jwt` entry's own `.constraints` (which stays empty unless the
whole nested object is missing). Replaced with a small recursive
`collectConstraintMessages(errors)` that also walks `.children`, so every
offending key is still listed at once, same as today — verified by
temporarily breaking a nested field's value and reading the thrown message
before reverting.

### `getEnv()` / `getEnvOrThrow()` helpers

Added to `src/shared/utils/env.utils.ts` (already holds `isDev`/`isProd`,
which switch to using `getEnv` themselves):

```ts
export function getEnv<P extends Path<AppEnv>>(
  configService: ConfigService<AppEnv, true>,
  key: P,
): PathValue<AppEnv, P> {
  return configService.get(key, { infer: true })
}

export function getEnvOrThrow<P extends Path<AppEnv>>(
  configService: ConfigService<AppEnv, true>,
  key: P,
): Exclude<PathValue<AppEnv, P>, undefined> {
  return configService.getOrThrow(key, { infer: true })
}
```

`Path`/`PathValue` are `@nestjs/config`'s own exported generic types (same
ones `ConfigService.get`'s typed overload uses), so `getEnv`/`getEnvOrThrow`
give the exact same compile-time type safety and autocomplete as calling
`.get`/`.getOrThrow` directly — just without repeating `{ infer: true }` at
every call site, and without a call site ever forgetting it.

### `parseCorsDomainsConfigValue` — the one-line style fix from the issue

```diff
-  return values.length ? values : undefined
+  if (!values.length) return undefined
+
+  return values
```

## Consumer updates (15 files, 31 call sites)

Every `configService.get('KEY', { infer: true })` → `getEnv(configService, '<domain>.KEY')`;
every `.getOrThrow(...)` → `getEnvOrThrow(...)`. `ConfigService`/`AppEnv`
imports stay (still needed for the injection type) — only the call syntax
changes. Domain prefix per the table above:

| File | Keys (old → new dot-path) |
|---|---|
| `shared/utils/env.utils.ts` | `NODE_ENV` → `app.NODE_ENV` (×2, in `isDev`/`isProd`) |
| `shared/config/swagger.config.ts` | `SWAGGER_ENABLED` → `swagger.SWAGGER_ENABLED`; `SWAGGER_USER`/`SWAGGER_PASSWORD` → `swagger.SWAGGER_USER`/`swagger.SWAGGER_PASSWORD` (`getEnvOrThrow`) |
| `main.ts` | `CORS_DOMAINS` → `cors.CORS_DOMAINS`; `PORT` → `app.PORT` |
| `modules/auth/auth.cookies.ts` | `COOKIE_DOMAIN` → `cors.COOKIE_DOMAIN` |
| `modules/system/system.service.ts` | `APP_NAME` → `app.APP_NAME` |
| `modules/auth/strategies/jwt.strategy.ts` | `JWT_SECRET` → `jwt.JWT_SECRET` |
| `common/captcha/captcha.config.ts` | `CLOUDFLARE_TURNSTILE_SECRET_KEY` → `captcha.CLOUDFLARE_TURNSTILE_SECRET_KEY` |
| `modules/auth/password-reset/password-reset.service.ts` | `CLIENT_URL` → `app.CLIENT_URL` |
| `common/jwt/jwt.config.ts` | `JWT_SECRET` → `jwt.JWT_SECRET` |
| `common/mongo/mongo.config.ts` | `MONGO_URI` → `mongo.MONGO_URI` |
| `modules/auth/auth.service.ts` | `JWT_REFRESH_SECRET` (×2) → `jwt.JWT_REFRESH_SECRET`; `AUTH_DUMMY_PASSWORD_HASH` → `jwt.AUTH_DUMMY_PASSWORD_HASH`; `JWT_ACCESS_TOKEN_EXPIRES_IN` → `jwt.JWT_ACCESS_TOKEN_EXPIRES_IN`; `JWT_REFRESH_TOKEN_EXPIRES_IN` → `jwt.JWT_REFRESH_TOKEN_EXPIRES_IN` |
| `common/throttler/throttler.config.ts` | `THROTTLE_TTL`/`THROTTLE_LIMIT` → `throttler.THROTTLE_TTL`/`throttler.THROTTLE_LIMIT` |
| `common/email/email.service.ts` | `APP_NAME` → `app.APP_NAME`; `EMAIL_SENDER` → `email.EMAIL_SENDER` |
| `common/email/resend.config.ts` | `RESEND_API_KEY` → `email.RESEND_API_KEY` |
| `modules/users/users.service.ts` | `RESET_TOKEN_SECRET` (×2) → `jwt.RESET_TOKEN_SECRET` |

`.env` / `.env.sample` are unaffected — env var names on disk don't change,
only how the validated result is grouped and read in code.

## Commit breakdown

1. `docs(ai): plan for MY-73 env config domains` — this file, before any code.
2. `refactor(shared/config): split AppEnv into domain groups` — the new
   `env.config.ts` (8 domain classes, `groupEnvByDomain`,
   `collectConstraintMessages`, the `CORS_DOMAINS` cross-domain handling).
3. `refactor(shared/utils): add getEnv/getEnvOrThrow, use in isDev/isProd,
   fix parseCorsDomainsConfigValue return` — `env.utils.ts`.
4. `refactor: repoint the 14 remaining AppEnv consumers through getEnv/getEnvOrThrow`
   — the rest of the table above.
5. `docs(ai): record env-config-nested-by-domain decision, update
   architecture.md/map.md` — new decision record; architecture.md's
   Configuration and Environment section; map.md's `shared/config/env.config.ts`
   row.

## Verification

- `bun run lint`.
- `bun run build` — mandatory (broken dot-path key only shows up at compile
  time via `Path<AppEnv>`).
- Manual: boot the app, confirm no startup validation error; temporarily
  unset a required key to confirm the aggregated multi-line error still
  lists it (proves `collectConstraintMessages` recursion works); temporarily
  set `NODE_ENV=production` without `CORS_DOMAINS` to confirm the manual
  cross-domain check still fires with the original message text.
