# Architecture Rules

## Scope

These rules apply to the Swoosh Server backend.

## Architecture

- Use NestJS with module-based structure.
- Keep business code in `src/modules`.
- Keep shared infrastructure in `src/common`.
- Keep shared config, constants, and helpers in `src/shared`.
- Reuse existing helpers before creating parallel abstractions.

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

## Query Endpoint Pattern

- Prefer DTO-based parsing and validation over ad hoc request checks.
- Normalize query input in DTOs or dedicated query helpers, not inside services.
- Keep module-specific filtering rules in the module.
- When a list endpoint follows a query-options builder pattern, keep using it.
- Keep default sort and limit values in module constants when reused.

## Application Bootstrap (`src/main.ts`)

- Global route prefix is `api/v1`. Do not set per-controller prefixes that fight it.
- A single global `ValidationPipe` is wired via `setupValidation` (`src/shared/config/validation.config.ts`) with `whitelist`, `transform`, and `forbidNonWhitelisted`: unknown properties are rejected and payloads are transformed to their DTO types. Rely on it — do not hand-validate shapes in services.
- Swagger is served via `setupSwagger` at `/api/v1/docs`. `SwaggerModule.setup` mounts the docs UI on the raw HTTP adapter, outside Nest's request pipeline — `AllExceptionsFilter` does not (and will not) apply to it, including once basic-auth is added there.
- Also wired at bootstrap: `cookie-parser` (refresh cookie), `helmet` (security headers), `enableCors` with origins from `CORS_DOMAINS` and `credentials: true`, and `x-powered-by` disabled.
- `PORT` is read with `getOrThrow` — it is a required env var.
- Keep global wiring in `main.ts`; do not scatter global config into feature modules.

## Global Providers

- `ThrottlerGuard` is registered globally as an `APP_GUARD` (`src/common/throttler`); tighten specific routes with `@Throttle`. Throttling is skipped in dev via `skipIf`.
- `AllExceptionsFilter` (`src/common/errors`) is registered globally in `main.ts` via `app.useGlobalFilters`. There are still no global interceptors. If you add one, document it here and update the review/security skills in the same change.

## Persistence (Mongo)

- The Mongo connection is configured once in `src/common/mongo` via `MongooseModule.forRootAsync` (`mongo.config.ts`).
- Feature modules register their schemas with `MongooseModule.forFeature`; they do not open their own connections.
- Keep connection and driver config in `MongoModule`.

## Error Handling

- Services throw built-in Nest HTTP exceptions (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, …). A global `AllExceptionsFilter` (`src/common/errors`) catches every exception and maps it to the canonical envelope in `auth-and-api-contracts.md` (Error Response Contract) — do not hand-roll a different per-endpoint error shape.
- The global `ValidationPipe` (`src/shared/config/validation.config.ts`) is given an `exceptionFactory`, wired from `main.ts`, that turns `class-validator` errors into a `ValidationFailedException` carrying a flattened `fields` map. This is what lets the filter tell a field-validation 400 (`VALIDATION_ERROR`) apart from any other `BadRequestException` (`BAD_REQUEST`, no `fields`) — do not add a second `exceptionFactory` or bypass it with manual validation.
- Keep reused, user-facing error messages in `<feature>.constants.ts`; inline one-offs.
- Never expose persistence errors, secrets, or internal detail in a thrown message — the filter already keeps 5xx bodies generic and logs the real error server-side.
