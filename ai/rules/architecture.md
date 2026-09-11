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
- Swagger is served via `setupSwagger` at `/api/v1/docs`.
- Also wired at bootstrap: `cookie-parser` (refresh cookie), `helmet` (security headers), `enableCors` with origins from `CORS_DOMAINS` and `credentials: true`, and `x-powered-by` disabled.
- `PORT` is read with `getOrThrow` — it is a required env var.
- Keep global wiring in `main.ts`; do not scatter global config into feature modules.

## Global Providers

- `ThrottlerGuard` is registered globally as an `APP_GUARD` (`src/common/throttler`); tighten specific routes with `@Throttle`. Throttling is skipped in dev via `skipIf`.
- There are **no** global interceptors or exception filters. If you add one, document it here and update the review/security skills in the same change.

## Persistence (Mongo)

- The Mongo connection is configured once in `src/common/mongo` via `MongooseModule.forRootAsync` (`mongo.config.ts`).
- Feature modules register their schemas with `MongooseModule.forFeature`; they do not open their own connections.
- Keep connection and driver config in `MongoModule`.

## Error Handling

- Services throw built-in Nest HTTP exceptions (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, …). There is no global `@Catch` filter yet, so Nest's default format is returned today.
- The **target** error shape is the canonical envelope in `auth-and-api-contracts.md` (Error Response Contract); wiring a global `AllExceptionsFilter` to it is a planned task. Until then, do not hand-roll a different per-endpoint error shape.
- Keep reused, user-facing error messages in `<feature>.constants.ts`; inline one-offs.
- Never expose persistence errors, secrets, or internal detail in a thrown message.
