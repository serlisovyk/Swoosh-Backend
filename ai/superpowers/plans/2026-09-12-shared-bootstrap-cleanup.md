# Plan: shared-layer and bootstrap cleanup (MY-52)

## Context

MY-52 was filed against an earlier state of `src/shared`/`main.ts`. Since
then, MY-46 (env validation) and other work already landed two of its five
items:

- `NODE_ENV` already has `as const` + a derived union type, and `isProd`
  already exists next to `isDev` (`src/shared/utils/env.utils.ts`).
- `main.ts`'s local `PORT` var is already lowercase `port`.
- `CookieToken` is no longer dead (used by `shared/swagger/swagger.utils.ts`).

Remaining, verified against current `main.ts`/`src/shared`:

1. `setupValidation(app, exceptionFactory)` still mutates `app` instead of
   returning options — the one `get*Config`-family outlier.
2. `shared/utils/query.utils.ts` still mixes query-param parsing with value
   sanitizing, `normalizePhoneValue` lives apart from its sibling
   `normalizeEmailValue`, `toStringArrayQueryParam` is a pure alias of the
   private `toQueryArray`, and `shared/utils/index.ts` re-exports
   `query.utils.ts` via `export *` instead of named exports.
3. `noop(userPassword)` in `auth.service.ts` is still there, guarding against
   an unused-var lint rule that already ignores rest siblings by default
   (`ignoreRestSiblings: true`, no override in `eslint.config.mjs`).
4. `bootstrap()` still has no `.catch`/exit code, no
   `app.enableShutdownHooks()`, and `app.disable('x-powered-by')` still
   duplicates `helmet()`'s own default.

## Scope

Only the four items above. All consumers of the touched `shared/utils`
functions already import from the `@shared/utils` barrel (verified by grep),
so moving files internally needs no consumer-side import changes — only the
barrel and the two moved/renamed files.

## Commit breakdown

1. **docs**: this plan + spec (single commit, before any code).
2. **refactor(shared/config)**: `setupValidation` → `getValidationConfig()`
   (pure options, no `exceptionFactory` param); `main.ts` builds the
   `ValidationPipe` itself, merging the returned options with its own
   `exceptionFactory`. New decision record for the `get*Config` (returns
   options) vs `setup*(app)` (mutates app) convention, since the issue itself
   names and rejects an alternative (`APP_PIPE` registration). Architecture
   rule added.
3. **refactor(shared/utils)**: split `query.utils.ts` (pure query-param
   parsing: `toStringArrayQueryParam` — renamed from the private
   `toQueryArray`, dropping the redundant alias layer — `toNumberArrayQueryParam`,
   `toBooleanQueryParam`) from a new `sanitize.utils.ts` (`trimStringValue`,
   `trimStringArrayValue`, `normalizeEmailValue`, `normalizePhoneValue`,
   moved in from the deleted `phone.utils.ts`). Barrel switches to named
   exports only. Update `ai/map.md` and `ai/skills/query-filters.md`.
4. **refactor(auth)**: drop `noop(userPassword)` and its import; delete
   `src/shared/utils/app.utils.ts` and its barrel export (last usage).
5. **fix(bootstrap)**: `bootstrap().catch(...)` logs and `process.exit(1)`
   on startup failure; `app.enableShutdownHooks()` added; redundant
   `app.disable('x-powered-by')` removed (`helmet()` already sets
   `hidePoweredBy` by default). Update `ai/rules/architecture.md`'s
   Application Bootstrap section and `ai/map.md`'s `main.ts` row.

## Verification

- `bun run lint`, `bun run build` after each code commit.
- Manual reasoning only (no test suite) — no behavior-sensitive manual repro
  needed beyond confirming the build catches every import-path change from
  the `shared/utils` split.

## Out of scope

- Anything already fixed by MY-46/MY-51/MY-44 (see Context above).
- MY-50 (request logging), MY-46 remainder (env schema — already done).
