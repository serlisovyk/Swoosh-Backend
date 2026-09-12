---
name: security-review
description: Use when reviewing Swoosh Server backend code for auth, authorization, validation, secret handling, token behavior, cookies, CORS, data exposure, or unsafe database operations.
---

# Security Review

## Focus

- **Access-token validation & authorization** — `guards/jwt.guard.ts`, `strategies/jwt.strategy.ts`, `guards/roles.guard.ts`. Protected routes actually guarded; role checks correct.
- **Token secrets** — access uses `JWT_SECRET`, refresh uses `JWT_REFRESH_SECRET`; never shared, never logged, never returned in responses. Both tokens' `expiresIn` (`JWT_ACCESS_TOKEN_EXPIRES_IN`/`JWT_REFRESH_TOKEN_EXPIRES_IN`) is schema-required (see [decisions/env-validated-at-boot](../decisions/2026-09-12-env-validated-at-boot.md)) — a boot that reaches `auth.service.ts` guarantees a non-empty string, so a JWT with no expiry would mean the schema itself regressed to optional, not a per-call `get`/`getOrThrow` choice.
- **Refresh cookie** — `refreshToken` is HttpOnly, `Secure` in production, sane `SameSite` and path. Refresh token never placed in a response body. This API and its frontend are on different sites, so `sameSite: 'none'` + `secure: true` in production is correct, not a relaxation — flag the opposite (`'strict'`/`'lax'` in prod) as the bug, per [decisions/refresh-cookie-cross-site-policy](../decisions/2026-09-11-refresh-cookie-cross-site-policy.md).
- **Password & reset-token hashing** — passwords hashed with argon2; reset tokens stored **hashed** via HMAC (`hashTokenWithSecret` + `RESET_TOKEN_SECRET`) — flag any second lookup format (plain sha256, raw token) as a regression. Reset-token lookup and consumption must be one atomic `findOneAndUpdate`, not a separate find-then-clear. `request-password-reset` does not reveal email existence, and login (`validateUser`) takes the same time whether the account exists or not (a dummy `argon2.verify` runs on the not-found path) — flag any branch whose timing depends on account existence.
- **DTO validation** — global `ValidationPipe` whitelist/forbid-unknown behavior (`src/shared/config/validation.config.ts`); no unvalidated input reaching services.
- **Data exposure** — public responses never include passwords, reset tokens, hashed values, or internal-only fields; docs match (`*.swagger.ts`).
- **CORS & config** — credentialed CORS restricted to expected origins; `CORS_DOMAINS` is required at boot in every environment (schema-enforced, see [decisions/env-config-nested-by-domain](../decisions/2026-09-12-env-config-nested-by-domain.md)) — flag any change that makes it optional or environment-conditional again as a silent-`*`-origin regression. Secrets are read via `getEnv(configService, 'domain.NAME')` / `getEnvOrThrow(...)` (`@shared/utils`, see [decisions/env-config-nested-by-domain](../decisions/2026-09-12-env-config-nested-by-domain.md)) at the point of use, never hard-coded, declared in both `src/shared/config/env.config.ts` and `.env.sample`, and never logged. A bare `configService.get`/`.getOrThrow` call, or one with an explicit type argument, is a regression — the type must come from the schema via `getEnv`/`getEnvOrThrow`, not a direct call or an assertion.
- **Captcha / throttling** — Turnstile on public-credential endpoints; auth throttling stricter than global defaults.
- **Request logging** (`src/common/logging`) — the per-request log line is method/path/status/duration/requestId only. Flag any change that logs the request body, the `Authorization` header, cookies, query strings, or any raw header dump. `x-request-id` is echoed back only after `REQUEST_ID_PATTERN` validates it — flag anything that writes a client-supplied header value straight into a response header or a log line unvalidated (header/log injection).
- **Docs accessibility** — `/api/v1/docs` (and its schema at `/api/v1/docs-json`) must not be reachable without credentials outside dev; flag `setupSwagger` being called unconditionally, or before `helmet`/`cookie-parser`/`enableCors` in `main.ts`, as a regression. `SWAGGER_USER`/`SWAGGER_PASSWORD` must be read with `getOrThrow`, not `get` — a `get` that resolves to `undefined` would serve the schema with no real password required. Known, accepted gap: the docs basic-auth is not covered by the global `ThrottlerGuard` (it's raw middleware outside Nest's pipeline) — don't re-flag this as a new finding; a fix needs a new design, not a one-line change. See [decisions/swagger-access-in-prod](../decisions/2026-09-11-swagger-access-in-prod.md).

## Current auth assumption

Refresh tokens are **stateless**. Logout clears the cookie but does not revoke already-issued refresh tokens before expiry. Do not claim revocation exists unless a token version or blacklist is actually implemented.

## Output

- One line per finding: `path:line — risk. fix.` Most severe first. Tie every finding to a concrete code path.
