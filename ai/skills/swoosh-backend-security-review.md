---
name: swoosh-backend-security-review
description: Use when reviewing Swoosh Server backend code for auth, authorization, validation, secret handling, token behavior, cookies, CORS, data exposure, or unsafe database operations.
---

# Swoosh Backend Security Review

## Focus

- **Access-token validation & authorization** — `guards/jwt.guard.ts`, `strategies/jwt.strategy.ts`, `guards/roles.guard.ts`. Protected routes actually guarded; role checks correct.
- **Token secrets** — access uses `JWT_SECRET`, refresh uses `JWT_REFRESH_SECRET`; never shared, never logged, never returned in responses.
- **Refresh cookie** — `refreshToken` is HttpOnly, `Secure` in production, sane `SameSite` and path. Refresh token never placed in a response body.
- **Password & reset-token hashing** — passwords hashed with argon2; reset tokens stored **hashed**, never plaintext; `request-password-reset` does not reveal email existence.
- **DTO validation** — global `ValidationPipe` whitelist/forbid-unknown behavior (`src/shared/config/validation.config.ts`); no unvalidated input reaching services.
- **Data exposure** — public responses never include passwords, reset tokens, hashed values, or internal-only fields; docs match (`*.swagger.ts`).
- **CORS & config** — credentialed CORS restricted to expected origins; secrets sourced from env (`src/shared/constants/env.constants.ts`), not hard-coded.
- **Captcha / throttling** — Turnstile on public-credential endpoints; auth throttling stricter than global defaults.

## Current auth assumption

Refresh tokens are **stateless**. Logout clears the cookie but does not revoke already-issued refresh tokens before expiry. Do not claim revocation exists unless a token version or blacklist is actually implemented.

## Output

- One line per finding: `path:line — risk. fix.` Most severe first. Tie every finding to a concrete code path.
