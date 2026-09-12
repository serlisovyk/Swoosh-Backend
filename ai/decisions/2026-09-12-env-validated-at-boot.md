# Env validated at boot with a zod schema

Date: 2026-09-12 · Status: accepted

## Context

`ConfigModule.forRoot({ isGlobal: true })` had no schema and no `validate`. Two consequences:

- `configService.getOrThrow<number>('THROTTLE_TTL')` (and `THROTTLE_LIMIT`, `PORT`) never converted anything — the generic is an unchecked compiler assertion, env vars are always strings.
- A missing or malformed env var crashed the app the first time that specific key was read at runtime (e.g. `AUTH_DUMMY_PASSWORD_HASH` on the first failed login), not at boot, and one key at a time.

## Decision

- A zod schema (`src/shared/config/env.config.ts`) covers every key in `.env.sample`, passed as `ConfigModule.forRoot`'s `validate`. A failing env throws one `Error` at bootstrap listing every invalid/missing key at once (zod collects all issues in a single pass).
- `ConfigService` is injected as `ConfigService<AppEnv, true>` (`AppEnv = z.infer<typeof envSchema>`) everywhere it's used. Reads are `configService.get('KEY', { infer: true })` — no explicit `<T>` type argument, because the type is schema-derived, not asserted at the call site. `getOrThrow` (still without a type argument) is kept only where a key is genuinely schema-optional and the call site wants a hard crash if it's missing — `SWAGGER_USER`/`SWAGGER_PASSWORD` outside dev, in `setupSwagger`.
- `ConfigModule.forRoot({ ..., cache: true })`: env is read once at boot and cached. A runtime env change needs a restart to take effect. This matches how the process is actually deployed (env fixed at container start) and is a deliberate choice, not an implicit side effect of turning caching on.
- `CORS_DOMAINS` is the one key whose requiredness differs by environment (per the issue): required and non-empty in production (schema-level `superRefine`), defaulted to `http://localhost:3000` in development so a fresh checkout still boots. `SWAGGER_ENABLED` is coerced to a real `boolean`.
- `NODE_ENV` (`src/shared/constants/env.constants.ts`) gets `as const` — required to build a real `z.enum` literal union from it. `isProd` is added next to `isDev` in `src/shared/utils/env.utils.ts`. Both are also item 2 of MY-52 (not yet merged when this landed); doing them here, once, avoids MY-52 re-adding a second `isProd` or a second `as const` — per that issue's own coordination note.
- No `AppConfigService` wrapper class — config stays a schema plus plain factory functions, matching the existing `get*Config` pattern for every other library wrapper (`mongo`, `throttler`, `captcha`, `resend`, `jwt`).
- `ms`'s `StringValue` (`JWT_ACCESS_TOKEN_EXPIRES_IN`/`JWT_REFRESH_TOKEN_EXPIRES_IN`) is a branded template-literal type; the schema validates these as plain non-empty strings rather than attempting to regex-match `ms`'s duration grammar (out of scope: no business-format validation beyond type/requiredness). The two read sites in `auth.service.ts` get the branded type via inline call-site context / a declared function return type, not a bare `as` cast.

## Consequences

- Any environment (dev, stand, prod) missing a key the schema requires now fails at boot instead of on first use. This was already true in practice for most of these keys (`getOrThrow` calls existed before), so real running stands should already have them; the one **new** requirement is `CORS_DOMAINS` in production, which previously degraded silently to a `*` CORS origin instead of failing — a prod stand relying on that silent default will now need `CORS_DOMAINS` set before it can boot.
- `cache: true` means a `.env` edit on a running process is not picked up without a restart.
- Reversing schema-at-boot validation, or moving to a per-environment schema, needs a new dated record here, not an edit to this one.
