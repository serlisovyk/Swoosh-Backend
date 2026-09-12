# Architecture Rules

## Scope

These rules apply to the Swoosh Server backend.

## Architecture

- Use NestJS with module-based structure.
- Keep business code in `src/modules`.
- Keep shared infrastructure in `src/common`.
- Keep shared config, constants, and helpers in `src/shared`.
- Reuse existing helpers before creating parallel abstractions.
- A third-party library's own registration/config (`X.registerAsync`/`X.forRootAsync`, its config factory) is a `src/common/<x>` wrapper module — same shape as `mongo`, `captcha`, `email`, `throttler`, `jwt`. Domain logic that happens to use that library (e.g. `JwtStrategy`, which answers "who is this user" and depends on `UserService`) stays in the feature module that owns the domain question, even though it touches the same library. Splitting on "library glue vs. domain logic", not on "everything JWT-related in one place", is what keeps `common` framework-only.
- Feature modules (`src/modules/*`) must not depend on each other bidirectionally. If module A imports from module B (service, DTO, util, type), B must never import anything from A — pick one direction and map data across the boundary with a type A owns, don't reach into B's DTOs. See [decisions/no-user-auth-cycle](../decisions/2026-09-11-no-user-auth-cycle.md): `auth` depends on `user` (correct — `auth` orchestrates registration/login); `user` used to import `auth`'s `RegisterDto` and a crypto helper, which was the cycle. Fixed by giving `user` its own `CreateUserInput` and moving the crypto helper to `shared`.
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
- A service injects `@InjectModel` only for models its own module owns. Data owned by another module goes through that module's exported service, never through a direct `@InjectModel` of its model — see [decisions/no-cross-module-model-injection](../decisions/2026-09-11-no-cross-module-model-injection.md). Was: `FavoritesService` injected `User`/`Product` models and queried their collections directly. Now: `FavoritesService` depends on `UserService`/`ProductsService`, which own the query shape (`select`/`populate`/optimistic-lock update) for their own collections.

## Query Endpoint Pattern

- Prefer DTO-based parsing and validation over ad hoc request checks.
- Normalize query input in DTOs or dedicated query helpers, not inside services.
- Keep module-specific filtering rules in the module.
- When a list endpoint follows a query-options builder pattern, keep using it.
- Keep default sort and limit values in module constants when reused.

## Application Bootstrap (`src/main.ts`)

- Global route prefix is `api/v1`. Do not set per-controller prefixes that fight it.
- A single global `ValidationPipe` is wired via `setupValidation` (`src/shared/config/validation.config.ts`) with `whitelist`, `transform`, and `forbidNonWhitelisted`: unknown properties are rejected and payloads are transformed to their DTO types. Rely on it — do not hand-validate shapes in services.
- Swagger is served via `setupSwagger(app, configService)` at `/api/v1/docs`, called **after** `cookie-parser`/`helmet`/`enableCors` so those apply to docs responses too (Express matches middleware/routes in registration order — calling `setupSwagger` earlier, as this file used to, meant helmet's headers never reached the docs). `SwaggerModule.setup` mounts the docs UI on the raw HTTP adapter, outside Nest's request pipeline — `AllExceptionsFilter` does not (and will not) apply to it, including the basic-auth gate described below.
- `setupSwagger` does not run unconditionally: `SWAGGER_ENABLED="false"` skips route registration entirely (404, not 401). Outside dev, it also requires `SWAGGER_USER`/`SWAGGER_PASSWORD` (`getOrThrow` — missing either crashes boot) and wraps every request under the docs path in an HTTP Basic check; dev keeps open access. See [decisions/swagger-access-in-prod](../decisions/2026-09-11-swagger-access-in-prod.md).
- Also wired at bootstrap: `cookie-parser` (refresh cookie), `helmet` (security headers), `enableCors` with origins from `CORS_DOMAINS` and `credentials: true`, and `x-powered-by` disabled.
- `PORT` is read with `getOrThrow` — it is a required env var.
- Keep global wiring in `main.ts`; do not scatter global config into feature modules.

## Global Providers

- `ThrottlerGuard` is registered globally as an `APP_GUARD` (`src/common/throttler`); tighten specific routes with `@Throttle`. Throttling is skipped in dev via `skipIf`.
- `AllExceptionsFilter` (`src/common/errors`) is registered globally in `main.ts` via `app.useGlobalFilters`. There are still no global interceptors. If you add one, document it here and update the review/security skills in the same change.

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
