# AppEnv nested by domain, one file per domain, reads go through getEnv()/getEnvOrThrow()

Date: 2026-09-12 · Status: accepted

## Context

`AppEnv` (`src/shared/config/env.config.ts`, see
[decisions/env-validated-at-boot](2026-09-12-env-validated-at-boot.md)) had
grown into one flat class, 22 `class-validator` fields spanning 8 unrelated
domains (app/runtime, CORS, JWT/auth, captcha, swagger, mongo, email,
throttler) — every new env var was a fresh argument about where in the file
it belonged. Separately, `configService.get('KEY', { infer: true })` /
`.getOrThrow(...)` was repeated 31 times across 15 files: noisy, and the
`{ infer: true }` flag was easy to forget or miscopy.

## Decision

- `AppEnv` (`src/shared/config/env.config.ts`) is nested by domain: `app`
  (`AppConfig`), `cors` (`CorsConfig`), `jwt` (`JwtConfig`), `captcha`
  (`CaptchaConfig`), `swagger` (`SwaggerConfig`), `mongo` (`MongoConfig`),
  `email` (`EmailConfig`), `throttler` (`ThrottlerConfig`) — each its own
  `@ValidateNested()` `@Type(() => X)` class, in its own file under
  `src/shared/config/env/` (`app.env.ts`, `cors.env.ts`, …). Every field
  keeps its original name, type, and decorators; only which class/file it
  lives in changed. `@nestjs/config`'s `ConfigService.get`/`getOrThrow`
  already resolve dot-paths at runtime (`lodash.get` against the validated
  config, confirmed by reading
  `node_modules/@nestjs/config/dist/config.service.js`) and export the
  `Path`/`PathValue` generic types that give this full compile-time
  inference — nesting needed no framework workaround.
- `CORS_DOMAINS` is now always required, read only from env, with **no**
  environment-conditional default. It previously defaulted to
  `http://localhost:3000` in development and was only required in
  production — that meant its validation depended on `NODE_ENV`, a
  *different* domain (`AppConfig`) than `CorsConfig`, which a nested class's
  own decorators can't see without smuggling a duplicate field across. Per
  author review, the dev-only default was dropped instead of worked around:
  `.env`/`.env.sample` already set `CORS_DOMAINS` unconditionally, so the
  fallback was solving a problem that doesn't occur in practice. `CorsConfig`
  now validates its own field with no cross-domain dependency at all —
  **no domain field depends on another domain's value**, which is the
  simpler invariant to keep going forward: if a future field seems to need
  one, prefer dropping the conditional (as here) over reaching across
  domains.
- `env.config.ts` holds only the `AppEnv` composition class. The three other
  responsibilities that used to share a file with it — building the nested
  plain object from the flat source config, recursively collecting
  `class-validator` error messages, and orchestrating the two into one
  aggregated startup error — are each their own file:
  `group-env-by-domain.utils.ts` (`groupEnvByDomain`),
  `collect-constraint-messages.utils.ts` (`collectConstraintMessages`),
  `validate-env.ts` (`validateEnv`, importing the other two). Same split
  applied one level down: `SwaggerConfig`'s `SWAGGER_ENABLED` coercion lives
  in its own `parse-swagger-enabled.utils.ts` (`parseSwaggerEnabled`),
  imported by `swagger.env.ts`, not inlined in the class file.
- `@ValidateNested()` puts a failing nested field's constraint message on the
  child `ValidationError`'s `.children`, not on the top-level domain entry's
  own `.constraints`. `validateEnv`'s error-flattening walks `.children`
  recursively, so a failing boot still lists every offending key across
  every domain in one aggregated error — verified directly (temporarily
  validating a config missing keys in five different domains at once and
  reading the thrown message).
- New `getEnv(configService, key)` / `getEnvOrThrow(configService, key)`
  (`src/shared/utils/env.utils.ts`) wrap `ConfigService.get`/`.getOrThrow`
  and add `{ infer: true }` for you; `key` is typed `Path<AppEnv>` (same
  type `@nestjs/config`'s own overload uses), so a typo or a stale domain
  prefix fails at compile time exactly like a bad key would against the flat
  class before. All 31 call sites across 15 files go through one of these
  two now — no more bare `.get`/`.getOrThrow` calls reading `AppEnv`.
- One second-order effect from typing `getEnv`'s return type directly as
  `PathValue<AppEnv, P>` (accurate) rather than a free generic default (as
  `ConfigService.get` itself does): two call sites in `auth.service.ts` that
  read `JWT_ACCESS_TOKEN_EXPIRES_IN`/`JWT_REFRESH_TOKEN_EXPIRES_IN` used to
  get `ms`'s branded `StringValue` type "for free" via contextual typing
  overriding `ConfigService.get`'s free generic default — that trick doesn't
  survive going through a wrapper with a concrete return type, so those two
  sites now cast explicitly (`as StringValue`, commented). Same runtime
  value; the cast that was implicit before is honest now.
- `SwaggerConfig.SWAGGER_ENABLED`'s coercion reuses `toBooleanQueryParam`
  (`@shared/utils`) through a small local `parseSwaggerEnabled` helper
  (`parse-swagger-enabled.utils.ts`, imported by `swagger.env.ts`) instead of
  a hand-rolled equivalent (unset → `true`, `'true'`/`'false'` → boolean,
  anything else fails `@IsBoolean()`). The
  "unset → `true`" branch is **not** folded into `toBooleanQueryParam`
  itself: that function is shared with `products`' query-param DTOs
  (`isHit`/`isNewArrival`/`hasDiscount`), where an absent query param must
  stay `undefined` (meaning "don't filter on this"), not become `true` — a
  shared default belongs in the one call site that needs it, not in a
  general-purpose helper other callers rely on behaving differently.
- `MongoConfig.MONGO_URI` dropped its `@Matches(/^mongodb(\+srv)?:\/\//)`
  format check per author review — it's now `@IsString() @IsNotEmpty()`
  only, same as every other secret/URI-shaped value in the schema. A
  malformed `MONGO_URI` now fails when Mongoose actually connects, not at
  boot.

## Consequences

- A new env var joins the domain file it belongs to under
  `src/shared/config/env/`, keyed by its own name unchanged (e.g.
  `jwt.NEW_KEY`), not a new top-level `AppEnv` field — see
  `ai/rules/architecture.md` → Configuration and Environment.
- `CORS_DOMAINS` must be set in every environment, including local dev —
  `.env.sample` and this repo's own `.env` files already had it, so no
  environment needed a change.
- `env-validated-at-boot.md`'s mechanism-level claims (flat `AppEnv`, direct
  `.get('KEY', { infer: true })`, `CORS_DOMAINS`'s dev default/`@ValidateIf`)
  describe the state as of that decision, superseded by this one for those
  specifics — its core decision (validate at boot, `class-validator`,
  error-aggregation, `cache: true`, the `StringValue` non-goal) still stands
  unchanged.
- No domain class depends on another domain's field. If a future env var
  seems to need one, prefer removing the conditional (like `CORS_DOMAINS`
  here) over reaching across nested classes.
