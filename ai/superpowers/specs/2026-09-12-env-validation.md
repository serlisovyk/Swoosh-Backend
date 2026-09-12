# Spec: Validate env at boot, remove lying `ConfigService` generics

## Problem

Two real defects (MY-46):

1. `configService.getOrThrow<number>('THROTTLE_TTL')` (and `THROTTLE_LIMIT`, `PORT`) does not convert anything — env vars are always strings, the generic is an unchecked assertion. Works today only through JS coercion where a `number`-typed option receives a string.
2. `ConfigModule.forRoot({ isGlobal: true })` has no schema and no `validate`. A typo or missing env var crashes the app the first time that specific key is read (a live request, e.g. first login attempt hitting `AUTH_DUMMY_PASSWORD_HASH`), not at boot.

Two related silent-degradation bugs called out in the issue:

3. `throttler.config.ts` skips throttling in dev via `skipIf: () => isDev(configService)` with no log — a prod host misconfigured with `NODE_ENV=development` silently loses rate limiting.
4. `parseCorsDomainsConfigValue` returns `undefined` when `CORS_DOMAINS` is unset, `cors` then defaults `origin` to `*`. Combined with `credentials: true` this isn't an open CORS hole (browsers reject `*` with credentials) but is a silently broken CORS setup in prod.

## Approach

- Add a zod schema (`src/shared/config/env.config.ts`) covering every key in `.env.sample`, passed to `ConfigModule.forRoot` as `validate`. A failing env throws one `Error` at bootstrap listing every invalid/missing key at once (zod collects all issues in one pass), not just the first one touched.
- `validate`'s return value is what `ConfigService` serves for `.get()`. The schema's `.transform()` does the necessary coercion (`PORT`/`THROTTLE_TTL`/`THROTTLE_LIMIT` → `number`, `CORS_DOMAINS` → `string[]`, `SWAGGER_ENABLED` → `boolean`), so the values coming out of `ConfigService` are already the right runtime type — no cast needed at the read site.
- Type all `ConfigService` injection points as `ConfigService<AppEnv, true>` (`AppEnv = z.infer<typeof envSchema>`, `true` = disallow `.get()` falling back to `undefined` for keys the schema declares). Reads become `configService.get('KEY', { infer: true })` — no explicit `<T>` argument, because the type comes from the schema, not from an assertion at the call site. This is the direct fix for defect 1: the generic isn't removed everywhere (`getOrThrow` stays where "crash if a genuinely optional-shaped value turns out missing" is still the right runtime behavior, e.g. `SWAGGER_USER`/`SWAGGER_PASSWORD` outside dev), but it stops being a type-level lie because the base type is now schema-derived, not asserted.
- `ConfigModule.forRoot({ ..., cache: true })` — env is read once at boot and cached; a runtime env change is not picked up without a restart. This matches how the process is actually deployed (env is fixed at container start) and is recorded as a decision, not left as an implicit side effect.

### CORS_DOMAINS — the one env-conditional key

Per the issue, this is the only variable whose *requiredness* differs by environment:

- `NODE_ENV=production` → `CORS_DOMAINS` required, non-empty (schema-level `superRefine`, not just `.optional()`).
- otherwise → defaults to `http://localhost:3000` if unset, so a fresh dev checkout still boots and gets a working CORS origin for a typical local frontend.

The existing `parseCorsDomainsConfigValue` (comma-split, trim, drop empties) is reused inside the schema's `.transform` rather than reimplemented — it now always runs against a guaranteed-present string (either the real value or the dev default), so its output is always a non-empty `string[]`, never `undefined`, and `AppEnv['CORS_DOMAINS']` is typed as `string[]` (no optionality to fake-check at the call site anymore).

### Throttling-disabled log

`getThrottlerConfig` is the `useFactory` for `NestThrottlerModule.forRootAsync`, which runs exactly once at boot. Logging "throttling disabled (NODE_ENV=development)" there — guarded by `isDev(configService)` — reaches the boot log exactly once, no separate lifecycle hook needed.

### `ms`'s `StringValue` (`JWT_ACCESS_TOKEN_EXPIRES_IN` / `JWT_REFRESH_TOKEN_EXPIRES_IN`)

`ms`'s `StringValue` is a branded template-literal type zod cannot express as a runtime-checked shape without an elaborate, easy-to-get-wrong regex (out of scope per the issue's "no business-format validation beyond type/requiredness"). The schema validates these as non-empty strings (guaranteed present, matching every other secret/required key); the two call sites in `auth.service.ts` keep a single explicit `as StringValue` cast, documented with a one-line comment. This is a narrower, honest cast at the one real type-system boundary, replacing the previous `getOrThrow<StringValue>()` call that asserted the same thing with no runtime backing at all.

### `NODE_ENV` as-const (small, necessary prerequisite)

`src/shared/constants/env.constants.ts`'s `NODE_ENV` object is declared without `as const`, so `z.enum([NODE_ENV.DEVELOPMENT, NODE_ENV.PRODUCTION])` needs real string literals, not the widened `string` type the object currently produces. Adding `as const` is required to build the schema at all — this is also item 2 of MY-52 (still Todo). Doing this one-line fix here (and noting it in the decision record) avoids MY-52 redoing it, per the issue's own coordination note. `isProd` (also named in MY-52) is added next to `isDev` for the same reason — the schema/CORS logic above needs a prod check.

## Non-goals (unchanged from the issue)

- No `AppConfigService` wrapper class.
- No secret manager / Vault / rotation.
- No business-value validation (ranges, limits) beyond type and requiredness.
- No change to `SWAGGER_USER`/`SWAGGER_PASSWORD` requiredness — stays the existing runtime-conditional `getOrThrow` in `setupSwagger`, only re-typed.

## Contract change

- App no longer boots with a missing/malformed required env var — it exits with a message listing every offending key. This is a deliberate behavior change to `main.ts`'s bootstrap, hence a spec.
- `CORS_DOMAINS` becomes a hard boot-time requirement in production (previously: silent `*` origin). Any prod stand missing it will now fail to start instead of serving a broken CORS setup — this must be checked against real stands before merge (see the issue's own risk note).
