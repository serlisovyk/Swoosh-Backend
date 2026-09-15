---
name: swagger-docs
description: Use when adding, refactoring, or reviewing Swagger/OpenAPI docs for Swoosh Server controllers, DTOs, response models, auth schemes, or public API contracts.
---

# Swagger Docs

## When to use

Any change to a public request/response contract, a new endpoint, or auth scheme docs. For auth-related docs also read `ai/rules/auth-and-api-contracts.md`.

## House pattern

Docs are **module-local wrappers**, not long inline decorator stacks on controllers.

- Each module has `<feature>.swagger.ts` exporting named decorators (e.g. `AuthEmailPropertyDocs`, `AuthTagDocs`) built with the shared factories from `@shared/swagger` (`src/shared/swagger/swagger.utils.ts`):
  - `createPropertyDocsDecorator` / `createOptionalPropertyDocsDecorator` — DTO property docs; examples come from `<feature>.constants.ts`.
  - operation wrappers compose `applyDecorators(ApiOperation, ApiOkResponse, ...)`.
  - `addSwaggerCookieAuth`, `createSwaggerOperationId` — global config in `src/shared/config/swagger.config.ts`.
- Controllers and DTOs import these named decorators; keep the decorator bodies out of the controller.

## Rules

- Every error response decorator (`ApiBadRequestResponse`, `ApiUnauthorizedResponse`, `ApiForbiddenResponse`, `ApiNotFoundResponse`, `ApiConflictResponse`, `ApiTooManyRequestsResponse`) must pass `type: ErrorResponseDocs` from `@common/errors` — it documents the canonical error envelope (`ai/rules/auth-and-api-contracts.md` → Error Response Contract). Keep the existing `description` text; only add `type`.
- Document public **response shapes**, never raw Mongoose/persistence models. Reuse response docs like `UserResponseDocs` across modules.
- Bearer auth for endpoints that read an access token from `Authorization`.
- Refresh **cookie** auth only for endpoints that actually read the `refreshToken` cookie (`SWAGGER_REFRESH_TOKEN_AUTH_NAME`).
- Mark public endpoints with empty `security` when global security is enabled.
- Never expose passwords, reset tokens, hashed values, or internal-only fields in docs.
- Do not document removed features (OAuth, email verification, auth sessions).
- When a request/response shape changes, update its Swagger in the **same** change.
- `description`/`summary` text is Russian — see `ai/rules/code-conventions.md` → Documentation language. Every module's Swagger is translated, including `system.swagger.ts` and the shared helpers in `@common/errors`.
- `ApiNotFoundDocs(entity: string)` renders `` `Объект «${entity}» не найден.` `` — pass a Russian entity phrase, not an English one, so the rendered sentence stays consistent.
- A sub-feature with its own controller (e.g. `auth/password-reset`) gets its own `<sub-feature>.swagger.ts` for its operations and property docs, not entries bolted onto the parent module's file — see `src/modules/auth/password-reset/password-reset.swagger.ts`. Only truly shared decorators (like the parent's `*TagDocs()`) stay imported from the parent file.

## Reaching the docs locally

- Dev (`NODE_ENV=development`, the local default): `/api/v1/docs` is open, no credentials.
- Any other `NODE_ENV`: set `SWAGGER_USER`/`SWAGGER_PASSWORD` in `.env` and send them as HTTP Basic — the app refuses to boot if `SWAGGER_ENABLED` isn't explicitly `"false"` and either is missing. `SWAGGER_ENABLED="false"` turns the route off entirely (404).
- See `ai/rules/architecture.md` (Application Bootstrap) and [decisions/swagger-access-in-prod](../decisions/2026-09-11-swagger-access-in-prod.md).

## Repeated responses

Four shared helpers in `@common/errors` (`src/common/errors/errors.swagger.ts`) exist to remove byte-identical `Api*Response` text that was copy-pasted across modules — use them instead of retyping the same decorator. They live in `common/errors`, not `shared/swagger`, because they're built on `ErrorResponseDocs` — see [decisions/common-vs-shared-boundary](../decisions/2026-09-12-common-vs-shared-boundary.md):

- `ApiAuthRequiredDocs()` → `ApiUnauthorizedResponse({ description: 'Требуется аутентификация.' })` — any endpoint that requires a valid access token.
- `ApiValidationErrorDocs()` → `ApiBadRequestResponse({ description: 'Валидация тела запроса не пройдена.' })` — a request body failed DTO validation. Do not use it for query-parameter validation.
- `ApiInvalidQueryDocs()` → `ApiBadRequestResponse({ description: 'Один или несколько параметров запроса недопустимы.' })` — a list endpoint's query DTO failed validation.
- `ApiNotFoundDocs(entity: string)` → `ApiNotFoundResponse({ description: \`Объект «${entity}» не найден.\` })` — pass the exact Russian entity phrase needed for the existing text. Never assume the shorter phrasing — check the byte-for-byte text you're replacing first.

**When not to use them — do not force a match:**

- Any text that differs from the helper's fixed string, even slightly, stays as a plain `Api*Response` call. Do not edit the wording to fit a helper — that changes the documented contract.
- `ApiForbiddenResponse` has **no shared helper**. Every "Only admins can …" text in the repo is action- and entity-specific (`create products` vs `access contact requests` vs `update newsletter subscriptions`, …) — none of them literally read the same, so there is nothing to generalize into one fixed string. If a future change makes several `ApiForbiddenResponse` calls byte-identical, add a helper then — don't add one speculatively.
- A single occurrence of a text is not a duplicate — leave it inline rather than routing it through a parameterized helper just for consistency.

## Verification

- `npm run build`.
- Spot-check the rendered spec at `/api/v1/docs` for one public, one protected, and one mutation endpoint when practical.
