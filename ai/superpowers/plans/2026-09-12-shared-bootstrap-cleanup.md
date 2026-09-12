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
   `@typescript-eslint/no-unused-vars` on a rest-sibling destructure. The
   issue assumed `ignoreRestSiblings` defaults to `true`; verified by
   deleting the call and running lint that it actually defaults to `false`
   (fires `'userPassword' is assigned a value but never used`). Fix: rename
   the destructured property to `_password` — the existing
   `varsIgnorePattern: '^_'` (already in `eslint.config.mjs`, used for args)
   already exempts it, no config change needed.
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
2. **refactor(bootstrap)**: combines the validation-config and bootstrap
   items since both land in `main.ts` and splitting them would mean staging
   the same file twice for no benefit:
   - `setupValidation` → `getValidationConfig(exceptionFactory)` (pure,
     takes the factory as a parameter and returns it as part of the options
     object); `main.ts` passes its `exceptionFactory` in and hands the whole
     result straight to `new ValidationPipe(...)` — no `app` argument, no
     spread/merge at the call site.
   - `bootstrap().catch(...)` logs and `process.exit(1)` on startup failure;
     `app.enableShutdownHooks()` added; redundant `app.disable('x-powered-by')`
     removed (`helmet()` already sets `hidePoweredBy` by default).
   - New decision record for the `get*Config` (returns options) vs
     `setup*(app)` (mutates app) convention, since the issue itself names and
     rejects an alternative (`APP_PIPE` registration). `ai/rules/architecture.md`
     and `ai/map.md` updated.
3. **refactor(shared/utils)**: split `query.utils.ts` (pure query-param
   parsing: `toStringArrayQueryParam` — renamed from the private
   `toQueryArray`, dropping the redundant alias layer — `toNumberArrayQueryParam`,
   `toBooleanQueryParam`) from a new `sanitize.utils.ts` (`trimStringValue`,
   `trimStringArrayValue`, `normalizeEmailValue`, `normalizePhoneValue`,
   moved in from the deleted `phone.utils.ts`). Barrel switches to named
   exports only. Folded into the same commit: drop `noop(userPassword)` in
   `auth.service.ts` (renaming the destructured property to `_password`,
   see Context item 3) and delete `src/shared/utils/app.utils.ts` (both touch
   the same barrel file, so splitting further just means staging it twice).
   Update `ai/map.md` and `ai/skills/query-filters.md`.

## Verification

- `bun run lint`, `bun run build` after each code commit.
- Manual reasoning only (no test suite) — no behavior-sensitive manual repro
  needed beyond confirming the build catches every import-path change from
  the `shared/utils` split.

## Out of scope

- Anything already fixed by MY-46/MY-51/MY-44 (see Context above).
- MY-50 (request logging), MY-46 remainder (env schema — already done).
