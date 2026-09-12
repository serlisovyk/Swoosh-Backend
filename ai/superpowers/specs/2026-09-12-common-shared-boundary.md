# Spec: fix the common/ vs shared/ boundary, move swagger out of common

MY-44 · 2026-09-12

## Why

`setupValidation` lives in `shared/config`, `setupSwagger` lives in
`common/swagger` — both are bootstrap functions over
`NestExpressApplication`, neither participates in Nest's DI container. With
no written rule, every new file is a fresh argument about where it goes.

## New rule

`common/` vs `shared/` is decided by **participation in Nest's DI
container**, not by "how infrastructural it feels":

- `common/` — what Nest itself instantiates: modules, providers, global
  filters/interceptors/guards.
- `shared/` — everything else: bootstrap `setup*(app)` functions, constants,
  utils, types, DTO-facing Swagger decorator factories.

Test: does creating this need the Nest container? No → `shared/`.

## Changed layout

No public behavior changes — same endpoints, same error envelope, same
OpenAPI schema. What changes is where code lives and which internal path
imports it.

### `src/common/swagger/` is disbanded

| Old | New | Why |
|---|---|---|
| `config/swagger.config.ts` (`buildSwaggerDocument`, `setupSwagger`) | `shared/config/swagger.config.ts` | bootstrap function, no DI |
| `utils/swagger.utils.ts` (`createPropertyDocsDecorator`, `createOptionalPropertyDocsDecorator`, `QueryPagePropertyDocs`, `QueryLimitPropertyDocs`, `createSwaggerOperationId`, `addSwaggerCookieAuth`) | `shared/swagger/swagger.utils.ts` | plain decorator/document-builder factories, no DI |
| `utils/swagger-basic-auth.utils.ts` (`createSwaggerBasicAuthMiddleware`) | `shared/swagger/swagger-basic-auth.utils.ts` | plain Express middleware factory, no DI |
| `constants/swagger.constants.ts` | `shared/constants/swagger.constants.ts` | plain values |
| `types/swagger.types.ts` | `shared/types/swagger.types.ts` | plain types |
| `common-responses.swagger.ts` (`ApiAuthRequiredDocs`, `ApiValidationErrorDocs`, `ApiInvalidQueryDocs`, `ApiNotFoundDocs`) | `common/errors/errors.swagger.ts` | see exception below |

### Exception: error-response Swagger helpers stay in `common/`

`ApiAuthRequiredDocs`/`ApiValidationErrorDocs`/`ApiInvalidQueryDocs`/`ApiNotFoundDocs`
need no DI container themselves, so the bare rule would send them to
`shared/swagger` too. But they're built directly on `ErrorResponseDocs`,
which lives in `common/errors` (kept there — it's part of the `errors`
package alongside the global `AllExceptionsFilter`, out of this issue's
scope). Moving the four helpers to `shared/swagger` would make `shared`
import `common` — the reverse-layering the DI rule exists to prevent, and
the exact failure mode the issue calls out for the constants move. They
move into `common/errors/errors.swagger.ts` instead, next to the class they
already wrap. This is the precedent for the next "no-DI code, but it needs
something from a DI-holding common package" case.

### Constants file split (deviation from the issue's literal wording)

The issue says swagger constants go into `shared/constants/api.constants.ts`
(the file `API_PREFIX`/`SWAGGER_DOCS_PATH` already live in, from MY-42).
Piling `SWAGGER_SITE_TITLE`/`SWAGGER_DESCRIPTION`/`SWAGGER_VERSION`/
`SWAGGER_ACCESS_TOKEN_AUTH_NAME`/`SWAGGER_REFRESH_TOKEN_AUTH_NAME`/
`SWAGGER_BASIC_AUTH_REALM` into that file would leave one file mixing two
unrelated constant groups (global API prefix vs. Swagger document
metadata), breaking the repo's one-file-per-topic convention in
`shared/constants/` (`cookie.constants.ts`, `list-query.constants.ts`,
`mongoose.constants.ts`, `time.constants.ts`). They go into a new
`shared/constants/swagger.constants.ts` instead; `api.constants.ts` is
untouched.

### Import path changes (12 files)

Every current `@common/swagger` import splits by what it names:

- Decorator/document-builder factories (`createPropertyDocsDecorator`,
  `createOptionalPropertyDocsDecorator`, `QueryPagePropertyDocs`,
  `QueryLimitPropertyDocs`) → `@shared/swagger`.
- `setupSwagger` → `@shared/config`.
- `SWAGGER_REFRESH_TOKEN_AUTH_NAME` → `@shared/constants`.
- `ApiAuthRequiredDocs`/`ApiValidationErrorDocs`/`ApiInvalidQueryDocs`/`ApiNotFoundDocs`
  → `@common/errors` (merges into the `ErrorResponseDocs` import already
  present in every one of these files).

Files touched: `main.ts`, `shared/swagger/list-query.swagger.ts`,
`modules/system/system.swagger.ts`, `modules/favorites/favorites.swagger.ts`,
`modules/users/users.swagger.ts`, `modules/products/products.swagger.ts`,
`modules/products/category/product-category.swagger.ts`,
`modules/auth/auth.swagger.ts`,
`modules/auth/password-reset/password-reset.swagger.ts`,
`modules/forms/contact-request/contact-request.swagger.ts`,
`modules/forms/individual-order/individual-order.swagger.ts`,
`modules/forms/newsletter-subscription/newsletter-subscription.swagger.ts`
— 12, not the issue's 7; the issue's list wasn't exhaustive (it missed
`main.ts`, `system`, `product-category`, and the pre-existing
`shared/swagger/list-query.swagger.ts`, which itself imported the page-docs
factory from the old `common/swagger`).

### Path aliases

`@shared/*` already maps to `src/shared/*` in `tsconfig.json` — no alias
change needed, verified only.

## Out of scope

- Moving `mongo`/`captcha`/`email`/`throttler` — already correctly in
  `common/`.
- Refactoring the decorator factories themselves.
- Anything else in `common/errors` beyond adding the four Swagger helpers.

## Risks

- 12 mechanical import-path edits with zero behavior change — the risk is a
  broken import only `bun run build` would catch, not a runtime bug. Build
  is mandatory here, not optional.
