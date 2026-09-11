# Plan: MY-47 — gate Swagger docs behind basic auth outside dev

Spec: `ai/superpowers/specs/2026-09-11-swagger-access-in-prod.md`

## Commit 0 (this one) — spec + plan

One commit, before code.

## Commit 1 — basic-auth middleware + gated `setupSwagger`

Files: `src/common/swagger/constants/swagger.constants.ts`,
`src/common/swagger/utils/swagger-basic-auth.utils.ts` (new),
`src/common/swagger/utils/index.ts`,
`src/common/swagger/config/swagger.config.ts`.

- `SWAGGER_BASIC_AUTH_REALM` constant (used in the `WWW-Authenticate`
  header).
- `createSwaggerBasicAuthMiddleware(docsPathPrefix, user, password)` in the
  new utils file: returns an Express middleware that no-ops (`next()`) for
  any request whose `req.path` doesn't start with `docsPathPrefix`; for a
  matching path, parses the `Authorization: Basic <base64>` header,
  compares user/password with `crypto.timingSafeEqual`, calls `next()` on
  match, otherwise responds `401` with `WWW-Authenticate: Basic
realm="..."`.
- `setupSwagger(app, configService)` (new second param):
  - returns immediately (no route registration) if
    `configService.get<string>('SWAGGER_ENABLED') === 'false'`.
  - if `!isDev(configService)`: `getOrThrow` both `SWAGGER_USER` and
    `SWAGGER_PASSWORD`, `app.use(createSwaggerBasicAuthMiddleware(...))`
    before building the document.
  - existing `DocumentBuilder`/`SwaggerModule.createDocument` unchanged.
  - `SwaggerModule.setup` gets `swaggerOptions: { persistAuthorization: true }`
    added to its options.

## Commit 2 — bootstrap order in `main.ts`

Files: `src/main.ts`.

- Move `app.use(cookieParser())`, `app.use(helmet())`, and
  `app.enableCors(...)` above the `setupSwagger(app, configService)` call
  (which now also takes `configService`, already available in `bootstrap()`).
  `app.disable('x-powered-by')` can stay where it is — it's a setting, not
  middleware order-dependent.

## Commit 3 — env contract

Files: `.env.sample`, `README.md`.

- `.env.sample`: add `SWAGGER_ENABLED`, `SWAGGER_USER`, `SWAGGER_PASSWORD`
  next to the other auth-adjacent secrets.
- `README.md`: document the new vars and the dev/non-dev behavior split
  under the existing Swagger mention.

## Commit 4 — documentation

- `ai/decisions/`: new record `2026-09-11-swagger-access-in-prod.md` —
  password-gate over full disable, `isDev` split, and the HTTPS-only
  caveat for HTTP Basic.
- `ai/rules/architecture.md`: Application Bootstrap section — updated
  middleware order and the enablement/auth gating rule.
- `ai/rules/auth-and-api-contracts.md`: Public API Contracts section — the
  docs are no longer unconditionally public outside dev.
- `ai/skills/security-review.md`: docs-accessibility check.
- `ai/skills/swagger-docs.md`: how to reach the docs locally now that
  non-dev requires credentials.

## Verification

- `npm run lint`
- `npm run build`
- Manual pass on the dev server (with `NODE_ENV` flipped to simulate
  non-dev): docs unreachable without credentials (`401` +
  `WWW-Authenticate`), reachable with correct ones, `SWAGGER_ENABLED=false`
  → `404`, an ordinary API endpoint unaffected by the auth gate, missing
  `SWAGGER_USER`/`SWAGGER_PASSWORD` in non-dev crashes boot.
