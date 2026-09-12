# Architecture Rules

## Scope

These rules apply to the Swoosh Server backend.

## Architecture

- Use NestJS with module-based structure.
- Keep business code in `src/modules`.
- `src/common` vs `src/shared` is decided by **participation in Nest's DI container**, not by "how infrastructural it feels": `common/` is what Nest itself instantiates (modules, providers, global filters/interceptors/guards); `shared/` is everything else (bootstrap `setup*(app)` functions, constants, utils, types, DTO-facing Swagger decorator factories). Test: does creating this need the Nest container? No → `shared/`. See [decisions/common-vs-shared-boundary](../decisions/2026-09-12-common-vs-shared-boundary.md). The one exception: no-DI code that itself depends on something in a DI-holding `common/*` package stays in `common/` next to that dependency, rather than moving to `shared/` and creating a `shared → common` import — see the same decision record's `errors.swagger.ts` example.
- Reuse existing helpers before creating parallel abstractions.
- A third-party library's own registration/config (`X.registerAsync`/`X.forRootAsync`, its config factory) is a `src/common/<x>` wrapper module — same shape as `mongo`, `captcha`, `email`, `throttler`, `jwt`. Domain logic that happens to use that library (e.g. `JwtStrategy`, which answers "who is this user" and depends on `UsersService`) stays in the feature module that owns the domain question, even though it touches the same library. Splitting on "library glue vs. domain logic", not on "everything JWT-related in one place", is what keeps `common` framework-only.
- Naming convention for `shared/config/*.config.ts`: a function named `get<X>Config` **returns options** — pure, no `app` argument, no side effect (`getMongoConfig`, `getThrottlerConfig`, `getTurnstileConfig`, `getResendConfig`, `getValidationConfig`). A function named `setup*(app)` **mutates the application** — the only category allowed to take `NestExpressApplication` and call methods on it (`setupSwagger`). Do not blend the two shapes in one function — see [decisions/get-config-returns-options-setup-mutates-app](../decisions/2026-09-12-get-config-returns-options-setup-mutates-app.md).
- Feature modules (`src/modules/*`) must not depend on each other bidirectionally. If module A imports from module B (service, DTO, util, type), B must never import anything from A — pick one direction and map data across the boundary with a type A owns, don't reach into B's DTOs. See [decisions/no-user-auth-cycle](../decisions/2026-09-11-no-user-auth-cycle.md): `auth` depends on `users` (correct — `auth` orchestrates registration/login); `users` used to import `auth`'s `RegisterDto` and a crypto helper, which was the cycle. Fixed by giving `users` its own `CreateUserInput` and moving the crypto helper to `shared`.
- A feature module that other modules need to reach into publicly exports a barrel (`<module>/index.ts`) — see `src/modules/auth/index.ts`. Other modules import from the barrel, never from the module's internal file paths (`@modules/auth`, not `@modules/auth/decorators/auth.decorator`).

## Module Structure

- Follow nearby modules before inventing a new layout.
- Keep `module`, `controller`, and `service` files as baseline module entrypoints.
- Add `dto`, `models`, `types`, `constants`, `utils`, and `swagger` files only when the module needs them.
- Keep module-local helpers, constants, and types next to the module until reuse is clear.
- Do not move feature-specific helpers into `src/shared` too early.

## Responsibility Boundaries

- Controllers handle routes, decorators, request extraction, and response handoff.
- Services contain business logic and database orchestration.
- DTOs define request shape and validation.
- Swagger docs live in module-local `*.swagger.ts` files.
- Keep public API contracts explicit.
- Do not leak persistence shape into public responses.
- A service injects `@InjectModel` only for models its own module owns. Data owned by another module goes through that module's exported service, never through a direct `@InjectModel` of its model — see [decisions/no-cross-module-model-injection](../decisions/2026-09-11-no-cross-module-model-injection.md). Was: `FavoritesService` injected `User`/`Product` models and queried their collections directly. Now: `FavoritesService` depends on `UsersService`/`ProductsService`, which own the query shape (`select`/`populate`/optimistic-lock update) for their own collections.

## Query Endpoint Pattern

- Prefer DTO-based parsing and validation over ad hoc request checks.
- Normalize query input in DTOs or dedicated query helpers, not inside services.
- Keep module-specific filtering rules in the module.
- When a list endpoint follows a query-options builder pattern, keep using it.
- Keep default sort and limit values in module constants when reused.

## Configuration and Environment

- `ConfigModule.forRoot` is wired with a `class-validator` schema (`src/shared/config/env.config.ts`'s `AppEnv` class, validated by `validate-env.ts`'s `validateEnv`) as its `validate` option, plus `cache: true`. A missing or malformed env var fails the whole boot with every offending key listed at once — do not read an env var with a bare `configService.get`/`getOrThrow` without first adding it to the schema.
- `AppEnv` is nested by domain (`app`, `cors`, `jwt`, `captcha`, `swagger`, `mongo`, `email`, `throttler`), each its own `@ValidateNested() @Type(() => X)` class, one per file under `src/shared/config/env/` — see [decisions/env-config-nested-by-domain](../decisions/2026-09-12-env-config-nested-by-domain.md). A new env var joins the domain class it belongs to, keyed by its own name unchanged (e.g. `jwt.JWT_SECRET`), not a new top-level `AppEnv` field. Every domain validates independently — no field's schema depends on another domain's value.
- Never call `ConfigService.get`/`getOrThrow` directly. Inject `ConfigService<AppEnv, true>` (`AppEnv` from `@shared/config`), never a bare `ConfigService`, and read every value through `getEnv(configService, 'domain.KEY')` / `getEnvOrThrow(configService, 'domain.KEY')` (`@shared/utils`) — they add `{ infer: true }` for you, typed off `AppEnv`'s nested shape via `@nestjs/config`'s own `Path`/`PathValue`. Reserve `getEnvOrThrow` for the few keys the schema itself leaves optional where the call site wants a hard crash on absence (e.g. `SWAGGER_USER`/`SWAGGER_PASSWORD` outside dev).
- `CORS_DOMAINS` is always required, read only from env, no environment-conditional default — set it in every `.env` (including local dev).
- `cache: true` on `ConfigModule` means a running process does not pick up an env change without a restart — this is deliberate, not an oversight.

## Application Bootstrap (`src/main.ts`)

- `app.enableShutdownHooks()` is called right after `NestFactory.create`, before any other wiring — on `SIGTERM`/`SIGINT` Nest now runs `OnModuleDestroy`/`OnApplicationShutdown` lifecycle hooks (including `@nestjs/mongoose`'s connection-close hook) before the process exits, instead of dropping the Mongo connection.
- `bootstrap()` is called as `bootstrap().catch((error) => { logger.error(...); process.exit(1) })`, never bare `void bootstrap()`. A startup failure (bad env, unreachable Mongo, anything thrown during wiring) now always logs and exits 1 instead of surfacing as a silent unhandled rejection.
- `app.use(requestLoggingMiddleware)` (`src/common/logging`) is the very first thing wired, before `cookie-parser`/`helmet`/`enableCors`, so the `x-request-id` header and the request timer cover the whole request. It assigns/echoes `x-request-id` on every response and logs method/path/status/duration once the response finishes (error for 5xx, warn for 4xx, debug otherwise); the two `system` module paths are skipped on a successful response to avoid uptime-monitor noise. See [decisions/request-logger-choice](../decisions/2026-09-12-request-logger-choice.md) for why this stays on Nest's built-in `Logger` instead of pino.
- `Logger.overrideLogger(PRODUCTION_LOG_LEVELS)` is called right after `configService` is available, when `!isDev(configService)` — this drops `'debug'`/`'verbose'` outside development and is what actually keeps the per-request `debug`-level log line quiet in production, not the path-skip above.
- Global route prefix is `api/v1`. Do not set per-controller prefixes that fight it.
- A single global `ValidationPipe` is built in `main.ts` as `new ValidationPipe(getValidationConfig(exceptionFactory))` (`src/shared/config/validation.config.ts`) — `whitelist`/`transform`/`forbidNonWhitelisted` plus the passed-in `exceptionFactory`, all returned as one options object, no `app` argument or merge at the call site. See the `get*Config`/`setup*(app)` naming convention above. Rely on it — do not hand-validate shapes in services.
- Swagger is served via `setupSwagger(app, configService)` (`src/shared/config/swagger.config.ts`) at `/api/v1/docs`, called **after** `cookie-parser`/`helmet`/`enableCors` so those apply to docs responses too (Express matches middleware/routes in registration order — calling `setupSwagger` earlier, as this file used to, meant helmet's headers never reached the docs). `SwaggerModule.setup` mounts the docs UI on the raw HTTP adapter, outside Nest's request pipeline — `AllExceptionsFilter` does not (and will not) apply to it, including the basic-auth gate described below.
- `setupSwagger` does not run unconditionally: `SWAGGER_ENABLED="false"` skips route registration entirely (404, not 401). Outside dev, it also requires `SWAGGER_USER`/`SWAGGER_PASSWORD` (`getOrThrow` — missing either crashes boot) and wraps every request under the docs path in an HTTP Basic check; dev keeps open access. See [decisions/swagger-access-in-prod](../decisions/2026-09-11-swagger-access-in-prod.md).
- Also wired at bootstrap: `cookie-parser` (refresh cookie), `helmet` (security headers, including its default `hidePoweredBy` — do not also call `app.disable('x-powered-by')`, that would just duplicate it), `enableCors` with origins from `CORS_DOMAINS` and `credentials: true`.
- `PORT` is a required env var (validated at boot by the `AppEnv` schema), read with the regular `get('PORT', { infer: true })`.
- Keep global wiring in `main.ts`; do not scatter global config into feature modules.

## Global Providers

- `ThrottlerGuard` is registered globally as an `APP_GUARD` (`src/common/throttler`); tighten specific routes with `@Throttle`. Throttling is skipped in dev via `skipIf`, and `getThrottlerConfig` (the `ThrottlerModule` `useFactory`, run once at boot) logs a warning when it is — a prod host misconfigured with `NODE_ENV=development` shows up in the boot log instead of silently losing rate limiting.
- `AllExceptionsFilter` (`src/common/errors`) is registered globally in `main.ts` via `app.useGlobalFilters`. Its 5xx log line includes `request.requestId` (set by `requestLoggingMiddleware`, see Application Bootstrap below) so a server error can be matched to its request-logging entry. There are still no global interceptors. If you add one, document it here and update the review/security skills in the same change.

## Persistence (Mongo)

- The Mongo connection is configured once in `src/common/mongo` via `MongooseModule.forRootAsync` (`mongo.config.ts`).
- The connection string is a single `MONGO_URI` env var, taken as-is from the provider (Atlas or any host) — do not reassemble it from separate protocol/login/password/host/db parts, see [decisions/single-mongo-uri](../decisions/2026-09-11-single-mongo-uri.md).
- `autoIndex` is `isDev(configService)` — Mongoose only rebuilds indexes on boot in dev; in prod a new index needs an explicit, deliberate step. `retryAttempts` is set explicitly rather than left at the driver default.
- Feature modules register their schemas with `MongooseModule.forFeature`; they do not open their own connections.
- Keep connection and driver config in `MongoModule`.

## Error Handling

- Services throw built-in Nest HTTP exceptions (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, …). A global `AllExceptionsFilter` (`src/common/errors`) catches every exception and maps it to the canonical envelope in `auth-and-api-contracts.md` (Error Response Contract) — do not hand-roll a different per-endpoint error shape.
- The global `ValidationPipe` (`src/shared/config/validation.config.ts`) is given an `exceptionFactory`, wired from `main.ts`, that turns `class-validator` errors into a `ValidationFailedException` carrying a flattened `fields` map. This is what lets the filter tell a field-validation 400 (`VALIDATION_ERROR`) apart from any other `BadRequestException` (`BAD_REQUEST`, no `fields`) — do not add a second `exceptionFactory` or bypass it with manual validation.
- Keep reused, user-facing error messages in `<feature>.constants.ts`; inline one-offs.
- Never expose persistence errors, secrets, or internal detail in a thrown message — the filter already keeps 5xx bodies generic and logs the real error server-side.
- `ApiAuthRequiredDocs`/`ApiValidationErrorDocs`/`ApiInvalidQueryDocs`/`ApiNotFoundDocs` (`src/common/errors/errors.swagger.ts`) are the shared Swagger response helpers for the canonical error envelope — see `ai/skills/swagger-docs.md`. They live in `common/errors`, not `shared/swagger`, because they're built on `ErrorResponseDocs`; see the DI-boundary exception above.
