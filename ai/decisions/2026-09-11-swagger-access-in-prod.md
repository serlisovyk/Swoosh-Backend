# Gate Swagger docs with basic auth in prod, don't disable them

Date: 2026-09-11 · Status: accepted

## Context

`setupSwagger(app)` ran unconditionally, including in production, exposing
the full API schema (every endpoint, DTO field, example, auth scheme)
publicly at `/api/v1/docs`. The frontend team also uses the docs against
non-dev stands, so disabling them outright there would just trade one
problem for another.

## Decision

- The docs stay reachable outside dev, but behind HTTP Basic auth
  (`SWAGGER_USER`/`SWAGGER_PASSWORD`), not removed.
- `SWAGGER_ENABLED="false"` is the escape hatch for turning the route off
  entirely (404) when even a password-gated schema is unwanted for a given
  stand.
- Dev keeps open access (`isDev(configService)`) — no credentials, matching
  how `isDev` already gates cookie `secure`/`sameSite`, `autoIndex`, and
  throttler `skipIf` elsewhere in this codebase.
- Outside dev, `SWAGGER_USER`/`SWAGGER_PASSWORD` are read with `getOrThrow`:
  a stand with `SWAGGER_ENABLED` true (the default) but no credentials
  configured **fails to boot**, rather than silently serving the schema
  without protection.

## Consequences

- HTTP Basic sends credentials on every request as base64 (not encrypted)
  — this is safe only because production already terminates HTTPS. If this
  API is ever served over plain HTTP in a non-dev environment, basic auth on
  the docs provides no real protection; that would need revisiting, not
  assuming.
- The docs password is a secret like any other — never logged, never
  echoed in an error body. The gate returns a bare `401` with a
  `WWW-Authenticate` challenge, not the canonical JSON error envelope: the
  docs route lives outside Nest's request pipeline (same reason
  `AllExceptionsFilter` doesn't reach it — see
  `ai/rules/architecture.md`), and a real basic-auth challenge is also what
  makes a browser prompt for credentials natively.
- Rolling this out requires handing `SWAGGER_USER`/`SWAGGER_PASSWORD` to
  whoever currently reads the docs on a non-dev stand before deploying —
  do this before, not after, or their access breaks with no warning.
- If OAuth/SSO or a private docs host ever replace this, that's a new
  decision superseding this one, not an edit to it.
