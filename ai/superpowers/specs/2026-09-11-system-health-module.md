# Spec: system module (`GET /api/v1`, `GET /api/v1/health`)

Issue: MY-48

## New public contract

Two new public, unauthenticated endpoints, both `@SkipThrottle()`:

- `GET /api/v1` → `200 { "message": "<APP_NAME> API" }`. `APP_NAME` comes from `ConfigService.getOrThrow<string>('APP_NAME')` — already a documented env var (`.env.sample`, used today by `src/common/email/email.service.ts`), not a new one.
- `GET /api/v1/health` → `200 { "status": "ok", "timestamp": "<ISO-8601>" }`.

Both are liveness-only: no dependency (Mongo, external services) is checked. `health` always returns `status: "ok"` if the process is up enough to handle the request — that is the point (cheap, no readiness semantics). Confirmed as the intended scope by the issue itself: readiness (`/health/ready`, Mongo ping) is explicitly out of scope, not an oversight.

## What the response must NOT contain

Both endpoints are unauthenticated, so the response body is deliberately minimal: no app version, no environment name (`NODE_ENV`), no hostname, no process uptime, no dependency status. Nothing that helps reconnaissance of an unauthenticated caller.

## Swagger

- Marked `security: []` (the codebase has global bearer security via `addSecurityRequirements` in `swagger.config.ts`; every public endpoint must opt out explicitly — same pattern as `ProductsFindFiltersDocs`, `NewsletterSubscriptionCreateDocs`).
- Response DTOs (`SystemHelloResponseDocs`, `SystemHealthResponseDocs`) document the shape so the schema isn't empty, per house style (`ai/skills/swagger-docs.md`).

## Routing

`SystemController` is `@Controller()` (no path segment) — under the global prefix `api/v1` this claims the bare `/api/v1` root for `GET`. No other controller in the repo registers a route at the bare prefix root, so this does not shadow or conflict with any existing route (checked against `ai/map.md`'s module list — every other controller has its own path segment).

## Out of scope (confirmed from the issue)

- `@nestjs/terminus`, a `/health/ready` variant, Mongo ping, metrics, uptime reporting.
- Monitoring/alerting integration.
