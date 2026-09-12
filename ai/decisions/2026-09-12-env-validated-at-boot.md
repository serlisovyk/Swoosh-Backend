# Env validated at boot with a class-validator schema

Date: 2026-09-12 · Status: accepted

## Context

`ConfigModule.forRoot({ isGlobal: true })` had no schema and no `validate`. Two consequences:

- `configService.getOrThrow<number>('THROTTLE_TTL')` (and `THROTTLE_LIMIT`, `PORT`) never converted anything — the generic is an unchecked compiler assertion, env vars are always strings.
- A missing or malformed env var crashed the app the first time that specific key was read at runtime (e.g. `AUTH_DUMMY_PASSWORD_HASH` on the first failed login), not at boot, and one key at a time.

## Decision

- An `AppEnv` class (`src/shared/config/env.config.ts`, `class-validator` decorators) covers every key in `.env.sample`. `validateEnv()` runs it through `plainToInstance` + `validateSync` and is passed as `ConfigModule.forRoot`'s `validate`. `validateSync` collects every failing property in one pass, so a failing env throws one `Error` at bootstrap listing every invalid/missing key at once — not just the first one touched.
- **Tried `zod` first, reverted to `class-validator`/`class-transformer`.** The first pass of this change added `zod` as a new dependency. `class-validator`/`class-transformer` are already dependencies — every DTO in this repo is a `class-validator` class — so a second validation library for one more schema added a parallel abstraction for no real gain; `class-validator` covers the same requirements (coercion via `@Type`/`@Transform`, conditional requiredness via `@ValidateIf`, aggregate-all-errors via `validateSync`). Reverted per author feedback before merge. One genuine gap surfaced while porting: `class-validator`'s `@IsUrl()` rejects bare `http://localhost` URLs unless given `{ require_tld: false }` — `zod`'s `z.url()` didn't have this restriction, so `CLIENT_URL`/`SERVER_URL` (both `http://localhost:*` in dev) needed the extra option.
- `ConfigService` is injected as `ConfigService<AppEnv, true>` (`AppEnv` is the class itself, referenced only as a type outside `env.config.ts`) everywhere it's used. Reads are `configService.get('KEY', { infer: true })` — no explicit `<T>` type argument, because the type is schema-derived, not asserted at the call site. `getOrThrow` (still without a type argument) is kept only where a key is genuinely schema-optional and the call site wants a hard crash if it's missing — `SWAGGER_USER`/`SWAGGER_PASSWORD` outside dev, in `setupSwagger`.
- `ConfigModule.forRoot({ ..., cache: true })`: env is read once at boot and cached. A runtime env change needs a restart to take effect. This matches how the process is actually deployed (env fixed at container start) and is a deliberate choice, not an implicit side effect of turning caching on.
- `CORS_DOMAINS` is the one key whose requiredness differs by environment (per the issue): required and non-empty in production (`@ValidateIf` gating `@IsArray()`, not just `@IsOptional()`), defaulted to `http://localhost:3000` in development so a fresh checkout still boots. `SWAGGER_ENABLED` is coerced to a real `boolean` via `@Transform` (any value other than `'true'`/`'false'`/unset fails `@IsBoolean()` instead of being silently treated as enabled).
- `NODE_ENV` (`src/shared/constants/env.constants.ts`) gets `as const` — required for `@IsEnum(NODE_ENV)` and the `AppEnv['NODE_ENV']` field to be a real literal union instead of `string`. `isProd` is added next to `isDev` in `src/shared/utils/env.utils.ts`. Both are also item 2 of MY-52 (not yet merged when this landed); doing them here, once, avoids MY-52 re-adding a second `isProd` or a second `as const` — per that issue's own coordination note.
- No `AppConfigService` wrapper class — config stays a schema plus plain factory functions, matching the existing `get*Config` pattern for every other library wrapper (`mongo`, `throttler`, `captcha`, `resend`, `jwt`).
- `ms`'s `StringValue` (`JWT_ACCESS_TOKEN_EXPIRES_IN`/`JWT_REFRESH_TOKEN_EXPIRES_IN`) is a branded template-literal type; the schema validates these as plain non-empty strings rather than attempting to regex-match `ms`'s duration grammar (out of scope: no business-format validation beyond type/requiredness). The two read sites in `auth.service.ts` get the branded type via inline call-site context / a declared function return type, not a bare `as` cast.

## Consequences

- Any environment (dev, stand, prod) missing a key the schema requires now fails at boot instead of on first use. This was already true in practice for most of these keys (`getOrThrow` calls existed before), so real running stands should already have them; the one **new** requirement is `CORS_DOMAINS` in production, which previously degraded silently to a `*` CORS origin instead of failing — a prod stand relying on that silent default will now need `CORS_DOMAINS` set before it can boot.
- `cache: true` means a `.env` edit on a running process is not picked up without a restart.
- Reversing schema-at-boot validation, or moving to a per-environment schema, needs a new dated record here, not an edit to this one.
