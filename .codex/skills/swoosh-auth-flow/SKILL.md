---
name: swoosh-auth-flow
description: Use when changing Swoosh Server JWT auth, register/login/logout/refresh behavior, password reset, current-user behavior, auth guards, cookies, or auth Swagger docs.
---

# Swoosh Auth Flow

## Overview

Work on backend auth as one server contract. Read `docs/rules/auth-and-api-contracts.md` before changing auth behavior.

## Rules

- Keep auth orchestration in `src/modules/auth`.
- Access tokens are returned in response bodies and consumed as `Authorization: Bearer <token>`.
- Refresh tokens live only in the `refreshToken` HttpOnly cookie.
- Keep access and refresh secrets separate: `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- Keep password reset aligned across DTOs, `AuthAccountService`, email template, user token fields, and Swagger docs.
- Do not reintroduce OAuth, email verification, or server-side auth sessions without an approved spec.

## Verification

- Run targeted auth tests when behavior changes.
- Run `npm run lint`.
- Run `npm run build` after contract, dependency, or file deletion changes.
