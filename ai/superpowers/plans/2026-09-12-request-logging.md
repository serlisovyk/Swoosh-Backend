# Plan: request logging and x-request-id (MY-50)

Issue: MY-50. Spec: `ai/superpowers/specs/2026-09-12-request-logging.md`.

## Why

No request trace exists today. A client-reported 500 can't be matched to a server-side log entry, and the global `AllExceptionsFilter` (MY-39) logs errors with no way to correlate them to the request that caused them.

## Commit breakdown

1. **docs(ai): spec + plan for request logging (MY-50)** — this spec and plan, alone, before any code.
2. **feat(logging): add request-id + request logging middleware** — new `src/common/logging/` package (constants, types incl. the `Express.Request` augmentation, the middleware, barrel).
3. **feat: wire request logging middleware and restrict prod log levels in main.ts** — `app.use(requestLoggingMiddleware)` first in the middleware chain; `NestFactory.create`'s `logger` option excludes `debug`/`verbose` outside development.
4. **feat(errors): include request-id in AllExceptionsFilter's error log** — append `request.requestId` to the existing 5xx log line.
5. **docs: record logger choice, document x-request-id contract, update map/architecture/security-review** — `ai/decisions/2026-09-12-request-logger-choice.md` (new), `ai/rules/architecture.md` (Application Bootstrap section — middleware placement + prod log-level note), `ai/rules/auth-and-api-contracts.md` (x-request-id as part of the contract, alongside the existing Error Response Contract section), `ai/map.md` (new `common/logging` package, updated `errors` row, drop the now-stale "no dedicated logger" line from "What this project does NOT have"), `ai/skills/security-review.md` (add: never log request bodies, `Authorization`, cookies, tokens — check that the new logging code doesn't).

## Verification

- `bun run lint` / `bun run build` clean.
- Manual, against a running dev server (per the spec's "Manual verification plan"): id generated when absent, id echoed when supplied and valid, invalid supplied id replaced, filter log and request log share an id on a forced 500, `/api/v1/health` produces no success log line, no sensitive data in any log line.
