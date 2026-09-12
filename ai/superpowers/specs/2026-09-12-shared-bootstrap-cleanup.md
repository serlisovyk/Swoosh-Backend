# Spec: shared-layer and bootstrap cleanup (MY-52)

## Why a spec

This changes observable process behavior (startup-failure handling, shutdown
handling) and a public helper's signature (`setupValidation` → `getValidationConfig`),
so per `ai/workflow.md` step 5 a spec is required alongside the plan.

## Behavior changes

### 1. Validation config becomes a pure function

- Before: `shared/config/validation.config.ts` exports
  `setupValidation(app, exceptionFactory)`, which calls
  `app.useGlobalPipes(new ValidationPipe({...}))` itself.
- After: it exports `getValidationConfig(): ValidationPipeOptions`, returning
  only `{ whitelist: true, transform: true, forbidNonWhitelisted: true }`.
  `main.ts` constructs the `ValidationPipe` itself:
  `new ValidationPipe({ ...getValidationConfig(), exceptionFactory })`.
- Runtime behavior of the `ValidationPipe` is unchanged — same three options,
  same `exceptionFactory` wiring. Only the split between "what the options
  are" and "wiring it into the app" changes, matching every other
  `get<X>Config`/`setup*(app)` pair in the codebase.

### 2. Bootstrap failure is no longer a silent unhandled rejection

- Before: `void bootstrap()` — a thrown/rejected `bootstrap()` produces an
  unhandled promise rejection with no application-level log line and no
  non-zero exit code. A process manager / container orchestrator sees the
  process exit (or hang) without a clear signal that startup itself failed.
- After: `bootstrap().catch((error) => { logger.error(...); process.exit(1) })`.
  A startup failure now always logs a message identifying it as a startup
  failure and exits with code 1.

### 3. Graceful shutdown hooks enabled

- Before: `app.enableShutdownHooks()` is never called — Nest's lifecycle
  hooks (`OnModuleDestroy`/`OnApplicationShutdown`, including Mongoose's own
  connection-close hook wired by `@nestjs/mongoose`) never run on `SIGTERM`.
- After: `app.enableShutdownHooks()` is called at bootstrap. On `SIGTERM`
  (any redeploy) or `SIGINT` (Ctrl+C locally), Nest now runs shutdown hooks
  before the process exits, closing the Mongo connection cleanly instead of
  dropping it.

### 4. `x-powered-by` header suppression stays single-sourced

- Before: both `app.disable('x-powered-by')` and `helmet()` (default
  `hidePoweredBy` behavior) suppress the same header.
- After: only `helmet()` does it. No behavior change — the header was never
  sent either way; one fewer no-op call.

## Non-behavior-changing refactors (still spec-relevant: file/export moves)

- `shared/utils/query.utils.ts` keeps only query-param parsing exports
  (`toStringArrayQueryParam`, `toNumberArrayQueryParam`,
  `toBooleanQueryParam`) — same input/output behavior, `toStringArrayQueryParam`
  is now the function itself rather than a wrapper around a same-behavior
  private `toQueryArray`.
- New `shared/utils/sanitize.utils.ts` holds `trimStringValue`,
  `trimStringArrayValue`, `normalizeEmailValue` (moved, unchanged) and
  `normalizePhoneValue` (moved from the deleted `phone.utils.ts`, unchanged).
- `shared/utils/index.ts` re-exports every file by name instead of
  `export * from './query.utils'`. No consumer import path changes — every
  current caller already imports from `@shared/utils`, not a deep file path
  (verified by repo-wide grep before starting).
- `noop` and `shared/utils/app.utils.ts` are removed; `auth.service.ts`'s
  `validateUser` drops the now-pointless `noop(userPassword)` call. The
  destructured-but-unused `userPassword` stays lint-clean because
  `@typescript-eslint/no-unused-vars`'s default `ignoreRestSiblings: true`
  (not overridden in `eslint.config.mjs`) already exempts a property
  destructured alongside a rest sibling (`...safeUser`).

## Public API impact

None. No HTTP-visible contract changes — `main.ts` still wires the same
`ValidationPipe` options, same global filters/middleware, same routes. The
only externally observable difference is operational: a broken boot now logs
and exits 1 instead of hanging/rejecting silently, and `SIGTERM` now drains
Nest's shutdown hooks before exit.

## Risks

- `enableShutdownHooks()` runs Nest's `OnModuleDestroy`/`OnApplicationShutdown`
  lifecycle across every module on shutdown. Reviewed: no module in this repo
  defines either hook today, so the only observable effect is
  `@nestjs/mongoose`'s built-in connection-close hook. Manually verified: the
  dev server (`bun run start:dev`) starts, responds to `GET /api/v1/health`,
  and exits promptly on Ctrl+C with no hang.
- The `shared/utils` file split changes import paths inside `shared/utils/`
  itself and the barrel, but not for any external consumer (confirmed via
  grep — every consumer imports `@shared/utils`, never a deep path). `bun run
  build` after the split is the safety net for anything missed.
