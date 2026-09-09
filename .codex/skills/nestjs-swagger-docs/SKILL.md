---
name: nestjs-swagger-docs
description: Use when adding, refactoring, or reviewing Swagger/OpenAPI docs for Swoosh Server controllers, DTOs, response models, auth schemes, or public API contracts.
---

# NestJS Swagger Docs

## Overview

Keep Swagger aligned with runtime behavior. Read `docs/rules/auth-and-api-contracts.md` for auth-related docs.

## Rules

- Prefer named module-local docs wrappers over long inline controller decorators.
- Document public response shapes, not raw persistence models.
- Use Bearer auth for protected endpoints that read access tokens from `Authorization`.
- Use refresh cookie auth only for endpoints that read `refreshToken` from cookies.
- Mark public endpoints with empty `security` when global security is enabled.
- Do not document removed features such as OAuth, email verification, or auth sessions.

## Verification

- Run `npm run build`.
- Spot-check docs for one public endpoint, one protected endpoint, and one mutation when practical.
