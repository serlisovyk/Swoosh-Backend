# Spec: gate Swagger docs behind basic auth outside dev

MY-47 · 2026-09-11

## Why

`setupSwagger(app)` runs unconditionally, including in production, so the
full API schema (every endpoint, DTO field name, example value, and auth
scheme) is public at `/api/v1/docs` — a ready-made attack surface map.
Separately, `setupSwagger(app)` is currently called before
`app.use(helmet())` in `main.ts`; since Express matches middleware/routes in
registration order, a request to a docs path is served by the docs route
before it ever reaches helmet, so helmet's security headers don't apply to
docs responses today.

## Changed behavior

### Enablement and auth gating

- `SWAGGER_ENABLED` (string `"false"` to disable, anything else — including
  unset — enables). When disabled, the docs routes are never registered:
  `/api/v1/docs` (and `-json`/`-yaml`/assets) return 404, not 401.
- When enabled:
  - **Dev** (`isDev(configService)`): docs are served with no basic auth, as
    today — this is the local/DX path, matching how `isDev` already gates
    cookie `secure`/`sameSite`, `autoIndex`, and throttler `skipIf`.
  - **Non-dev** (staging/prod): `SWAGGER_USER` and `SWAGGER_PASSWORD` are
    read with `getOrThrow` — if either is missing, the app fails at startup
    (crashes on boot) rather than serving the docs unprotected. When both
    are present, every request under the docs path prefix must present
    matching HTTP Basic credentials or gets a `401` with a
    `WWW-Authenticate: Basic` header (a real basic-auth challenge, not a
    JSON error — the docs route lives outside Nest's request pipeline, so
    the canonical error envelope does not apply here, same as it doesn't
    apply to the rest of `SwaggerModule.setup`, per
    `ai/rules/architecture.md`).
- The basic-auth check matches on the **path prefix** (`req.path` starting
  with `/api/v1/docs`), not on an Express mount point, because
  `@nestjs/swagger` serves the JSON/YAML spec at a **sibling** path
  (`/api/v1/docs-json`), not a sub-path of `/api/v1/docs`. Mounting the
  guard as `app.use('/api/v1/docs', middleware)` would miss `-json`/`-yaml`
  entirely (Express only matches sub-paths or an exact match on a mount
  point, not an arbitrary string-prefix sibling) and leave the schema
  readable without credentials even with the UI locked. The middleware is
  registered as an unconditional `app.use(middleware)` that checks the path
  itself and calls `next()` immediately for every other route, so it costs
  API requests one string-prefix check and nothing else.
- Credential comparison uses `crypto.timingSafeEqual` (constant-time) on
  both the username and the password, so a byte-by-byte compare can't be
  used to guess the credentials via response-time differences — same
  rationale as the login-timing fix in MY-53.

### Bootstrap order

`cookie-parser`, `helmet`, and `enableCors` now run **before**
`setupSwagger`, so helmet's headers (and CORS) apply to docs responses like
every other route. `x-powered-by` disabling is an app setting, not
middleware, so its position is unaffected.

### Swagger UI option

`persistAuthorization: true` is added to `SwaggerModule.setup`'s
`swaggerOptions` — the bearer token entered in the UI survives a page
reload. Unrelated to the auth gate itself; bundled because the same file is
being touched.

## Out of scope

- OAuth/SSO in front of the docs, or a separate integration for granting
  access.
- A separate private host for the documentation.
- Hiding individual endpoints from the schema.
- Env-schema validation (referenced by MY-46) — `SWAGGER_USER`/
  `SWAGGER_PASSWORD` being required together with `SWAGGER_ENABLED=true` is
  expressed as an explicit `getOrThrow` check in code, not a validation
  schema; revisit once MY-46 lands.

## Risks

- Rolling this out breaks the frontend's access to the docs on any non-dev
  stand until it's given `SWAGGER_USER`/`SWAGGER_PASSWORD` — coordinate
  before deploying.
- HTTP Basic sends credentials on every request (base64, not encrypted) —
  safe only over HTTPS. Production already terminates HTTPS; this is
  recorded as a decision, not re-litigated here.
- The docs password is a secret like any other: never logged, never
  echoed back in an error body (the middleware returns a fixed `401` body,
  no detail about which check failed).
