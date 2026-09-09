---
name: nestjs-swagger-docs
description: Use when adding, refactoring, or reviewing Swagger/OpenAPI docs for Swoosh Server controllers, DTOs, response models, auth schemes, or public API contracts.
---

# NestJS Swagger Docs

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

- Document public **response shapes**, never raw Mongoose/persistence models. Reuse response docs like `UserResponseDocs` across modules.
- Bearer auth for endpoints that read an access token from `Authorization`.
- Refresh **cookie** auth only for endpoints that actually read the `refreshToken` cookie (`SWAGGER_REFRESH_TOKEN_AUTH_NAME`).
- Mark public endpoints with empty `security` when global security is enabled.
- Never expose passwords, reset tokens, hashed values, or internal-only fields in docs.
- Do not document removed features (OAuth, email verification, auth sessions).
- When a request/response shape changes, update its Swagger in the **same** change.

## Verification

- `npm run build`.
- Spot-check the rendered spec at `/api/v1/docs` for one public, one protected, and one mutation endpoint when practical.
