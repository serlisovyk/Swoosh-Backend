---
name: swagger-docs
description: Use when adding, refactoring, or reviewing Swagger/OpenAPI docs for Swoosh Server controllers, DTOs, response models, auth schemes, or public API contracts.
---

# Swagger Docs

## When to use

Any change to a public request/response contract, a new endpoint, or auth scheme docs. For auth-related docs also read `ai/rules/auth-and-api-contracts.md`.

## House pattern

Docs are **module-local wrappers**, not long inline decorator stacks on controllers.

- Each module has `<feature>.swagger.ts` exporting named decorators (e.g. `AuthEmailPropertyDocs`, `AuthTagDocs`) built with the shared factories from `@common/swagger` (`src/common/swagger/utils/swagger.utils.ts`):
  - `createPropertyDocsDecorator` / `createOptionalPropertyDocsDecorator` — DTO property docs; examples come from `<feature>.constants.ts`.
  - operation wrappers compose `applyDecorators(ApiOperation, ApiOkResponse, ...)`.
  - `addSwaggerCookieAuth`, `createSwaggerOperationId` — global config in `src/common/swagger/config`.
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

## Repeated responses

Four shared helpers in `@common/swagger` (`src/common/swagger/common-responses.swagger.ts`) exist to remove byte-identical `Api*Response` text that was copy-pasted across modules — use them instead of retyping the same decorator:

- `ApiAuthRequiredDocs()` → `ApiUnauthorizedResponse({ description: 'Authentication is required.' })` — any endpoint that requires a valid access token.
- `ApiValidationErrorDocs()` → `ApiBadRequestResponse({ description: 'Request body validation failed.' })` — a request body failed DTO validation. Do not use it for query-parameter validation.
- `ApiInvalidQueryDocs()` → `ApiBadRequestResponse({ description: 'One or more query parameters are invalid.' })` — a list endpoint's query DTO failed validation.
- `ApiNotFoundDocs(entity: string)` → `ApiNotFoundResponse({ description: \`${entity} was not found.\` })` — pass the exact entity phrase needed for the existing text, including a suffix like `'with the provided id'` when that's part of the current wording (e.g. `ApiNotFoundDocs('Product with the provided id')` reproduces `'Product with the provided id was not found.'`). Never assume the shorter phrasing — check the byte-for-byte text you're replacing first.

**When not to use them — do not force a match:**

- Any text that differs from the helper's fixed string, even slightly, stays as a plain `Api*Response` call. Do not edit the wording to fit a helper — that changes the documented contract.
- `ApiForbiddenResponse` has **no shared helper**. Every "Only admins can …" text in the repo is action- and entity-specific (`create products` vs `access contact requests` vs `update newsletter subscriptions`, …) — none of them literally read the same, so there is nothing to generalize into one fixed string. If a future change makes several `ApiForbiddenResponse` calls byte-identical, add a helper then — don't add one speculatively.
- A single occurrence of a text is not a duplicate — leave it inline rather than routing it through a parameterized helper just for consistency.

## Verification

- `npm run build`.
- Spot-check the rendered spec at `/api/v1/docs` for one public, one protected, and one mutation endpoint when practical.
