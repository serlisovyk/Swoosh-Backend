# Plan: MY-46 env validation

See spec: `ai/superpowers/specs/2026-09-12-env-validation.md`.

## Commits

### 1. spec + plan (this commit)

### 2. `feat(config): validate env at boot with a zod schema`

- `package.json` — add `zod` dependency.
- `src/shared/constants/env.constants.ts` — add `as const` to `NODE_ENV` (prerequisite for `z.enum`; also closes MY-52 item 2, noted in the decision record).
- `src/shared/utils/env.utils.ts` — add `isProd`; re-type `isDev`/`isProd`/`parseCorsDomainsConfigValue` callers to `ConfigService<AppEnv, true>` where they take one.
- `src/shared/utils/index.ts` — export `isProd`.
- `src/shared/config/env.config.ts` (new) — `envSchema` (every `.env.sample` key), `AppEnv` type, `validateEnv()` (the `ConfigModule.forRoot` `validate` callback): coercion for `PORT`/`THROTTLE_TTL`/`THROTTLE_LIMIT`, url format for `CLIENT_URL`/`SERVER_URL`, email format for `EMAIL_SENDER`, non-empty strings for secrets, `mongodb(+srv)://` prefix check for `MONGO_URI`, `CORS_DOMAINS` prod-required/dev-defaulted via `superRefine` + `.transform` (reuses `parseCorsDomainsConfigValue`), `SWAGGER_ENABLED` transformed to `boolean`. On failure, throws one `Error` listing every issue (path + message).
- `src/shared/config/index.ts` — export `validateEnv`, `AppEnv`.
- `src/app.module.ts` — `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, cache: true })`.
- `.env.sample` — no content change expected (schema already matches it); re-verify in this commit.

### 3. `refactor(config): drop lying ConfigService generics at every read site`

Re-type every `ConfigService` injection as `ConfigService<AppEnv, true>` and switch reads from `getOrThrow<T>('KEY')` / `get<T>('KEY')` to `get('KEY', { infer: true })` (keeping `getOrThrow` only where a key is genuinely schema-optional and the call site wants a hard crash, i.e. `SWAGGER_USER`/`SWAGGER_PASSWORD` in `setupSwagger`):

- `src/main.ts` — `PORT`; `CORS_DOMAINS` now read as an already-parsed `string[]`, `parseCorsDomainsConfigValue` no longer called here.
- `src/common/mongo/mongo.config.ts`
- `src/common/throttler/throttler.config.ts` — plus: log "throttling disabled" via `Logger` when `isDev(configService)`, since this factory runs once at boot.
- `src/common/captcha/turnstile.config.ts`
- `src/common/email/resend.config.ts`, `src/common/email/email.service.ts`
- `src/common/jwt/jwt.config.ts`
- `src/common/swagger/config/swagger.config.ts` — `SWAGGER_ENABLED` compared as boolean, not string.
- `src/modules/auth/auth.service.ts` — `COOKIE_DOMAIN`, `JWT_REFRESH_SECRET`, `AUTH_DUMMY_PASSWORD_HASH`; `JWT_ACCESS_TOKEN_EXPIRES_IN`/`JWT_REFRESH_TOKEN_EXPIRES_IN` read via `.get(..., { infer: true })` then `as StringValue` (documented cast, see spec).
- `src/modules/auth/strategies/jwt.strategy.ts` — `JWT_SECRET`.
- `src/modules/auth/password-reset/password-reset.service.ts` — `CLIENT_URL`.
- `src/modules/user/user.service.ts` — `RESET_TOKEN_SECRET`.
- `src/modules/system/system.service.ts` — `APP_NAME`.

### 4. `docs: env schema, bootstrap validation, throttling/CORS behavior`

- `ai/decisions/2026-09-12-env-validated-at-boot.md` (new) — schema-at-boot, `cache: true`, no `AppConfigService`, `NODE_ENV as const` / `isProd` landing here ahead of MY-52.
- `ai/rules/architecture.md` — bootstrap/config section: env is schema-validated at boot, `ConfigService<AppEnv, true>` is the injection type, `CORS_DOMAINS` prod-required.
- `ai/map.md` — `shared/config` row gets `env.config.ts`; note the schema as the new source of truth alongside `.env.sample`.
- `ai/skills/security-review.md` — env/secret handling now schema-enforced at boot, not per-call `getOrThrow`.
- `README.md` — app refuses to start on incomplete/invalid env, lists every bad key.
- `.env.sample` — sync comments/keys with the schema if anything drifted.

## Verification

- `bun run lint`, `bun run build`.
- Manual boot: valid `.env` → starts; delete a required key → fails with all-issues-listed error, non-zero exit; existing endpoints still respond after fixing env back.
