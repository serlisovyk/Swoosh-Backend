# Vercel serverless entry stays separate from `main.ts`

**Status:** accepted

## Context

Deploying the existing `src/main.ts` to Vercel as-is fails: `bootstrap()` only
calls `app.listen(port)` and exports nothing, but `@vercel/node` expects the
target module to export a request handler (`(req, res) => ...`). Adapting
`main.ts` in place (e.g. branching on `process.env.VERCEL` to choose
`listen` vs. exporting a handler) was one option; adding a wholly separate
entry point was the other.

A second, independent problem ruled out the simplest tutorial pattern (a
`vercel.json` `builds` entry pointing `@vercel/node` straight at a `.ts`
source file): this repo resolves `@modules/*`/`@common/*`/`@shared/*` path
aliases via a `tsc-alias` build step (`bun run build`), not at the
TypeScript-compiler level alone. If Vercel compiles a `.ts` file itself, those
aliases never resolve, and the deployed function fails on the first aliased
import.

## Decision

- `src/serverless.ts` is a **new, separate entry point**, not a branch inside
  `main.ts`. It creates the Nest app, calls the same `setupApp(app)`
  (`src/shared/config/app.config.ts`) that `main.ts` uses, then `app.init()`
  instead of `app.listen()`, and exports a handler built from
  `app.getHttpAdapter().getInstance()`, cached at module scope across warm
  invocations.
- `api/index.ts` re-exports that handler from the **compiled**
  `dist/serverless.js`, not from `src/serverless.ts` directly — Vercel
  auto-detects `api/*` as Node functions and would otherwise compile the
  `.ts` source itself (reintroducing the alias problem). The relative
  `../dist/serverless.js` import has no aliases left to resolve.
- No `vercel.json` is committed to the repo — the build command
  (`bun run build`) is set directly in the Vercel project's dashboard
  settings instead, and no `builds`/`routes` config is needed either way.
  Vercel runs the configured build command (which already produces
  alias-free `dist/`) before it looks at `api/`.
- `api/index.ts` is deliberately excluded from `tsconfig.json`'s and
  `tsconfig.build.json`'s program (its `rootDir` is `src`, and the file
  imports build output that doesn't exist pre-build) and from the `lint`
  script / `lint-staged` glob (both scoped to `src/**/*.ts`). It is
  intentionally not part of this repo's own TS program — Vercel compiles it
  with its own toolchain at deploy time.

## Why not branch inside `main.ts`

- Keeps `app.listen()` (Docker/local dev) and the serverless handler on
  independent code paths — a change to one entry's shape (e.g. adding
  request-scoped setup only serverless needs) can't accidentally affect the
  other via a shared conditional.
- Avoids a runtime `if (isServerless)` branch in the one file every developer
  reads first; the split is visible at the file-list level instead.

## Vercel project settings (dashboard, not committed config)

- Framework Preset must be **Other**, not Vercel's built-in "NestJS" preset —
  that preset ignores `api/` entirely and tries to run `dist/main.js`
  directly as the function, hitting the same `No exports found` error this
  whole entry exists to avoid.
- Build Command: `bun run build`.
- Output Directory override: off (or `public`) — "Other" still expects a
  static output directory to exist even for a functions-only deploy; an
  empty `public/` (kept via `public/.gitkeep`) satisfies that with nothing
  actually served from it.

## Consequences

- Two files (`main.ts`, `serverless.ts`) must both call `setupApp` on any
  new bootstrap-level change — `ai/rules/architecture.md`'s Application
  Bootstrap section says so explicitly, and this is the one place a future
  change could silently drift if a new bootstrap step is added to only one
  of them.
- `api/index.ts` has no local type-checking or lint coverage from this
  repo's own `bun run lint`/`bun run build` — it is a two-line re-export, and
  Vercel's own build step is what actually type-checks/bundles it at deploy
  time.
- Vercel's own type-check of `api/index.ts` needs a `.d.ts` next to
  `dist/serverless.js` to resolve the relative import — `tsconfig.build.json`
  therefore sets `"declaration": true`, scoped to the build variant only.
  The base `tsconfig.json` (dev/lint/IDE) keeps `declaration: false` from
  [decisions/strict-ts-and-working-eslint](2026-09-12-strict-ts-and-working-eslint.md)
  unchanged — this doesn't reverse that decision, it only adds declarations
  to the shipped build output.
