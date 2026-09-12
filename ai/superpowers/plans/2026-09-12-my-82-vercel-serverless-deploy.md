# Plan: MY-82 — Vercel serverless deploy

Spec: [specs/my-82-vercel-serverless-deploy](../specs/2026-09-12-my-82-vercel-serverless-deploy.md)

## Verified before touching anything

- `src/main.ts:1-66` — `bootstrap()` builds the app, wires everything, then
  `await app.listen(port)`; the file has no export at all. Confirmed the
  exact wiring order to preserve when extracting (shutdown hooks → request
  logging middleware → global prefix → prod log-level override → validation
  pipe → exception filter → cookie-parser → helmet → CORS → Swagger → PORT
  read → listen), per `ai/rules/architecture.md`'s "Application Bootstrap"
  section (registration order matters for `helmet`/CORS reaching Swagger).
- `tsconfig.json:17-21` — path aliases (`@modules/*`, `@common/*`,
  `@shared/*`) only exist at the TS level; `package.json`'s `build` script
  (`nest build && tsc-alias -p tsconfig.build.json`) is what rewrites them to
  relative paths in `dist/`. Confirms Vercel must run against `dist/`, never
  compile `src/*.ts` itself.
- `src/shared/config/index.ts` — barrel already exports `setupSwagger`,
  `getValidationConfig`, `validateEnv`, `AppEnv`; adding `setupApp` here
  keeps the existing shape (`shared/config` = bootstrap `setup*(app)`
  functions + `get*Config` functions, per `ai/rules/architecture.md`).
- No existing `api/` or serverless entry anywhere in the repo (checked root +
  `src/`) — this is new, not a rename. No `vercel.json` is added either —
  the author configures the build command directly in the Vercel dashboard.
- `ai/decisions/` has no record about deploy targets — Docker is documented
  in `ai/map.md` as the only one; no existing decision to reverse.

## Changes

1. **`src/shared/config/app.config.ts`** (new)
   - `setupApp(app: NestExpressApplication): Promise<ConfigService<AppEnv, true>>`.
   - Body = today's `bootstrap()` contents from `app.enableShutdownHooks()`
     through `setupSwagger(app, configService)`, verbatim (same order, same
     calls) — just relocated, no behavior change. Returns `configService` at
     the end (caller reads `PORT` from it).
2. **`src/shared/config/index.ts`** — add `export { setupApp } from './app.config'`.
3. **`src/main.ts`** — replace the inline wiring with:
   ```ts
   async function bootstrap() {
     const app = await NestFactory.create<NestExpressApplication>(AppModule)
     const configService = await setupApp(app)
     const port = getEnv(configService, 'app.PORT')
     await app.listen(port)
   }
   ```
   Keep the top-level `bootstrap().catch(...)` call and the `Logger`
   construction exactly as-is.
4. **`src/serverless.ts`** (new) — Vercel entry, compiled to
   `dist/serverless.js`:
   ```ts
   import { NestFactory } from '@nestjs/core'
   import { NestExpressApplication } from '@nestjs/platform-express'
   import type { Request, Response } from 'express'
   import { setupApp } from '@shared/config'
   import { AppModule } from './app.module'

   type ExpressHandler = (req: Request, res: Response) => void

   let cachedHandlerPromise: Promise<ExpressHandler> | undefined

   async function createHandler(): Promise<ExpressHandler> {
     const app = await NestFactory.create<NestExpressApplication>(AppModule)
     setupApp(app)
     await app.init()
     return app.getHttpAdapter().getInstance()
   }

   function getHandler(): Promise<ExpressHandler> {
     if (!cachedHandlerPromise) {
       cachedHandlerPromise = createHandler().catch((error: unknown) => {
         cachedHandlerPromise = undefined
         throw error
       })
     }
     return cachedHandlerPromise
   }

   export default async function handler(req: Request, res: Response) {
     const server = await getHandler()
     server(req, res)
   }
   ```
   `cachedHandlerPromise` caches the **in-flight promise**, not the resolved
   handler — two concurrent requests on a cold instance both await the same
   promise instead of each triggering their own `NestFactory.create`/Mongo
   connection. On rejection the cache is cleared so the next request retries
   instead of being permanently poisoned by one failed cold start.
5. **`api/index.ts`** (new) — the file Vercel actually auto-detects as a Node
   function:
   ```ts
   export { default } from '../dist/serverless.js'
   ```
   Plain relative import into already-built, alias-free JS — nothing here
   needs Vercel's own compiler to understand `@common/*`/`@shared/*`.
6. **No `vercel.json`** — the build command (`bun run build`) is set in the
   Vercel project's dashboard settings instead of a committed config file.
   No `builds`/`routes` needed either way — zero-config: Vercel runs the
   configured build command, then auto-detects `api/index.ts` as the
   function.
7. **`.gitignore`** — confirm `dist/` is already ignored (it is, per current
   `.gitignore`); `api/` is committed source, not build output, so it needs
   no ignore entry.
8. **Docs**
   - `ai/map.md` — add `src/serverless.ts`, `src/shared/config/app.config.ts`,
     `api/index.ts` to the relevant tables; update `src/main.ts`'s row to
     describe the thin wrapper instead of inline wiring.
   - `ai/rules/architecture.md` — "Application Bootstrap" section: state that
     the wiring lives in `setupApp` (`shared/config/app.config.ts`) and is
     called from both `src/main.ts` (`app.listen`) and `src/serverless.ts`
     (`app.init`, cached handler), rather than describing it as inline
     `main.ts` code.
   - `README.md` — short "Deploying to Vercel" section: `api/index.ts`
     wrapper, build command set in the Vercel dashboard (not a committed
     `vercel.json`), env vars set in the Vercel dashboard, and the note that
     `bun run build` must produce `dist/` before the function bundle is
     created.
   - `ai/decisions/2026-09-12-vercel-serverless-entry.md` (new) — why a
     separate `src/serverless.ts` + `api/index.ts` wrapper instead of
     adapting `main.ts` in place: keeps `app.listen()` (Docker/local) and the
     serverless handler independent, and sidesteps Vercel's own TS compiler
     ever seeing path-aliased imports.

Not touched: any module under `src/modules`, DTOs, Swagger content, error
handling, Mongo config, Docker files, `docker-compose.yml`.

## Commit breakdown

1. `docs(ai): plan + spec for MY-82 Vercel serverless deploy` — this file +
   the spec, before any code.
2. `refactor(bootstrap): extract setupApp from main.ts` — `app.config.ts`,
   barrel export, `main.ts` trimmed down. No behavior change.
3. `feat(deploy): add Vercel serverless entry` — `src/serverless.ts`,
   `api/index.ts`.
4. `docs: document Vercel deploy path` — `ai/map.md`,
   `ai/rules/architecture.md`, `README.md`, the new decision record.

## Verification

- `bun run lint`
- `bun run build` — confirm `dist/serverless.js` is emitted and its
  `@common/*`/`@shared/*` imports are rewritten to relative paths (spot-check
  the compiled file).
- Manual: `bun run start:dev` still serves locally exactly as before.
- Manual: `vercel dev` (or a preview deploy) — hit `/api/v1` and one real
  endpoint, confirm no `No exports found` and no `Cannot find module` errors.
