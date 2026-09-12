# common/ vs shared/ boundary is decided by DI participation

Date: 2026-09-12 · Status: accepted

## Context

`setupValidation` lived in `shared/config`, `setupSwagger` lived in
`common/swagger` — both bootstrap functions over `NestExpressApplication`,
neither participating in Nest's DI container. With no written rule, every
new file was a fresh argument about where it belongs.

## Decision

`common/` vs `shared/` is decided by **participation in Nest's DI
container**, not by "how infrastructural it feels":

- `common/` — what Nest itself instantiates: modules, providers, global
  filters/interceptors/guards. Today: `mongo`, `captcha`, `email`,
  `throttler`, `jwt`, `errors`, `logging`.
- `shared/` — everything else: bootstrap `setup*(app)` functions, constants,
  utils, types, DTO-facing Swagger decorator factories.

Test: does creating this need the Nest container? No → `shared/`.

Applied as the first case: `src/common/swagger/` is disbanded (MY-44).
`setupSwagger`/`buildSwaggerDocument` moved to `shared/config/swagger.config.ts`;
the decorator/document-builder factories and the basic-auth middleware
factory moved to `shared/swagger/`; the swagger-specific constants and types
moved to `shared/constants/swagger.constants.ts` / `shared/types/swagger.types.ts`.

**Exception:** `ApiAuthRequiredDocs`/`ApiValidationErrorDocs`/`ApiInvalidQueryDocs`/`ApiNotFoundDocs`
need no DI themselves, but they're built directly on `ErrorResponseDocs`,
which lives in `common/errors` (kept there — it's part of the `errors`
package alongside the global `AllExceptionsFilter`). Moving these four to
`shared/swagger` would make `shared` import `common` — the reverse-layering
this rule exists to prevent. They moved into `common/errors/errors.swagger.ts`
instead, next to the class they wrap.

## Consequences

- `src/common/` holds only DI-participating packages.
- `src/shared/` holds only DI-free code; verified — no `@Module`/`@Injectable`
  anywhere under it.
- The next time no-DI code needs something from a DI-holding `common/*`
  package, it stays in `common/` next to that dependency (this
  `errors.swagger.ts` case is the precedent), rather than moving to `shared/`
  and creating a `shared → common` import.
- `ai/rules/architecture.md` and `ai/map.md` state the rule and the new
  layout; `ai/skills/swagger-docs.md` and `ai/skills/query-filters.md` point
  at the new import paths.
