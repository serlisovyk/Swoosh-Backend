# Plan: common/ vs shared/ boundary, move swagger out of common (MY-44)

Spec: `ai/superpowers/specs/2026-09-12-common-shared-boundary.md` — read
first for the destination layout, the error-response-helpers exception, and
why swagger constants get their own file instead of joining
`api.constants.ts`.

## Commit breakdown

1. `docs(ai): spec + plan for MY-44 common/shared boundary` — this file and
   the spec, before any code.
2. `refactor(shared): move swagger bootstrap, factories, constants, and
   types out of common` — create `shared/config/swagger.config.ts`,
   `shared/swagger/swagger.utils.ts`, `shared/swagger/swagger-basic-auth.utils.ts`,
   `shared/constants/swagger.constants.ts`, `shared/types/swagger.types.ts`;
   update `shared/swagger/list-query.swagger.ts`'s import; update the
   `shared/config`, `shared/swagger`, `shared/constants`, `shared/types`
   barrels; append `ApiAuthRequiredDocs`/`ApiValidationErrorDocs`/
   `ApiInvalidQueryDocs`/`ApiNotFoundDocs` to `common/errors/errors.swagger.ts`
   and export them from `common/errors/index.ts`; delete
   `src/common/swagger/` entirely. This commit does not build on its own —
   the 12 consumers below still import the now-deleted `@common/swagger`.
3. `refactor: repoint common/swagger consumers to shared/config, shared/swagger,
   shared/constants, common/errors` — the 12 files listed in the spec's
   import-path table. Builds clean after this commit.
4. `docs(ai): record common-vs-shared boundary decision, update
   architecture/map/skills for the new layout` — `ai/decisions/2026-09-12-common-vs-shared-boundary.md`,
   `ai/rules/architecture.md`, `ai/map.md`, `ai/skills/swagger-docs.md`,
   `ai/skills/query-filters.md`, `ai/rules/code-conventions.md` (the
   `QueryLimitPropertyDocsOptions` path example).

## Verification

- `bun run lint`.
- `bun run build` — mandatory, not optional (this is a pure import-path
  reshuffle; a broken path only shows up at compile time).
- Manual: `GET /api/v1/docs` renders in dev, unchanged; spot-check one
  response's error schema still points at the same `ErrorResponseDocs`
  shape.

## Done-when checklist (from the issue, restated)

- `src/common/swagger/` does not exist. ✓ after commit 2.
- Nothing in `src/common/` lacks DI participation — the only addition is
  four functions folded into the existing `errors` package, which already
  qualifies (global filter). ✓
- Nothing in `src/shared/` has `@Module`/`@Injectable`. ✓ (none of the moved
  code does).
- Rule recorded in `ai/rules/architecture.md`, decision record added. ✓
  commit 4.
- `bun run lint` / `bun run build` green.
- No public API or OpenAPI-schema change.
