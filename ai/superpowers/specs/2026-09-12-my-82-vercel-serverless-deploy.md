# Spec: Vercel serverless deploy (MY-82)

Issue: [MY-82](https://linear.app/my-workspace-5105/issue/MY-82/deploj-na-vercel-cherez-serverless-obyortku)

## Root cause

`src/main.ts` only calls `bootstrap()`, which builds the Nest app and calls
`app.listen(port)` — it never exports anything. Vercel's `@vercel/node`
builder expects the target module to export a request handler
(`(req, res) => ...`); with nothing exported, the deployed function throws
`No exports found in module "/var/task/dist/main.js"` on every cold start.

A second, independent blocker: this repo resolves `@modules/*`, `@common/*`,
`@shared/*` path aliases via `tsc-alias` as a build step
(`nest build && tsc-alias -p tsconfig.build.json`, see
[decisions/tsc-alias-for-prod-build](../decisions/2026-09-12-tsc-alias-for-prod-build.md)).
If Vercel compiles a `.ts` source file itself (its own esbuild, via `builds`
+ `@vercel/node` pointed at `src/*.ts`), those aliases are never resolved and
the deployed function fails on the first `@common/...`/`@shared/...` import.
The already-compiled `dist/` output (produced by our own `bun run build`)
must be what Vercel actually runs.

## Contract changes

None. No route, DTO, or response shape changes. This only adds a second way
to start the same Nest application; local dev (`bun run start:dev`) and the
Docker image (`bun run start:prod` → `node dist/main`) are unaffected.

## Fix

1. **Extract shared bootstrap wiring** out of `src/main.ts` into
   `setupApp(app)` (new, `src/shared/config/app.config.ts`, exported from
   `src/shared/config/index.ts`) — everything `bootstrap()` currently does
   between `NestFactory.create` and `app.listen`: shutdown hooks, request
   logging middleware, global prefix, prod log-level override, global
   validation pipe, global exception filter, `cookie-parser`, `helmet`,
   CORS, Swagger. Returns the resolved `ConfigService<AppEnv, true>` so the
   caller can still read `PORT`. `main.ts` becomes a thin caller; behavior
   is unchanged, only relocated.
2. **New serverless entry** `src/serverless.ts` — creates the Nest app,
   calls the same `setupApp(app)`, then `app.init()` instead of
   `app.listen()`, and exports a cached request handler
   (`app.getHttpAdapter().getInstance()`) as `default`. The **in-flight
   promise** is cached at module scope (not the resolved handler) so two
   concurrent requests on the same cold instance await one bootstrap instead
   of each creating their own Nest app/MongoDB connection; the cache is
   cleared on rejection so a failed cold start doesn't permanently poison
   later requests.
3. **New `api/index.ts`** — a minimal wrapper Vercel auto-detects as a Node
   function. It re-exports the `default` handler from the *compiled*
   `dist/serverless.js` (relative import, no path aliases — those are
   already resolved by our own build), so Vercel's own function bundler
   never has to parse `@common/*`/`@shared/*` imports itself.
4. **No `vercel.json` committed to the repo** — the build command
   (`bun run build`) is set directly in the Vercel project's dashboard
   settings instead. Vercel's zero-config Node runtime auto-detects
   `api/index.ts` and runs that build command first, so `dist/` (with
   aliases already resolved) exists before the function is bundled.
5. `src/main.ts` and the Docker/`start:prod` path keep calling
   `app.listen(port)` exactly as before — untouched behavior, just wired
   through the extracted `setupApp`.

## Out of scope

- Any change to request/response contracts, Swagger, or DTOs.
- Mongoose connection-pool tuning beyond "don't reconnect on every warm
  invocation" (reusing the cached app instance already covers this; no
  explicit pool-size change).
- Removing or changing the Docker/VPS deploy path — Vercel is an additional
  target, not a replacement.

## Verification

- `bun run lint` / `bun run build`.
- Manual: `vercel dev` locally (or a preview deploy) hitting `/api/v1` and
  one real endpoint; confirm no `No exports found` error and no
  `Cannot find module '@common/...'`/`'@shared/...'` error in the function
  logs.
- Manual: `bun run start:dev` still serves locally via `app.listen` exactly
  as before (no regression from the `setupApp` extraction).
