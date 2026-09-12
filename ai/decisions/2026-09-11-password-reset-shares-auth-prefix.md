# Password-reset keeps the `/auth` prefix and Swagger tag

Date: 2026-09-11 · Status: implemented (MY-54)

## Context

`AuthController` and `PasswordResetController` (renamed from `AuthAccountController`, moved from `auth/auth-account/` to `auth/password-reset/`) both declare `@Controller('auth')` and both use the same `AuthTagDocs()` Swagger tag. Two controllers sharing one route prefix and one Swagger tag looks like an oversight, and the MY-54 issue asked to consciously decide: leave it as-is (with a comment), or give password-reset its own subpath (e.g. `/auth/password-reset`).

## Decision

Keep the shared `/auth` prefix and `Auth` Swagger tag. A subpath would change two public routes (`POST /auth/request-password-reset` → `POST /auth/password-reset/request-password-reset`, and similarly for `reset-password`) — a breaking change for any client, for a purely internal code-organization reason. MY-54's own "Готово когда" requires the public paths to stay identical. `PasswordResetController` carries a comment pointing here so a future reader doesn't "fix" the apparent duplication by introducing that breaking change.

## Consequences

- The two controllers' route prefix and Swagger tag will keep looking duplicated; that's expected, not a bug.
- If password reset ever needs its own path for an unrelated reason, that's a new decision (and a breaking-change conversation with the frontend), not a cleanup.
