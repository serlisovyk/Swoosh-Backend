---
name: swoosh-backend-security-review
description: Use when reviewing Swoosh Server backend code for auth, authorization, validation, secret handling, token behavior, cookies, CORS, data exposure, or unsafe database operations.
---

# Swoosh Backend Security Review

## Focus

- Bearer access-token validation and role guards.
- Refresh cookie security options.
- Password hashing and reset-token hashing.
- DTO validation and whitelist behavior.
- Public response data exposure.
- CORS credentials and allowed origins.
- Destructive database cleanup scripts and migration safety.

## Current Auth Assumption

Refresh tokens are stateless. Do not claim logout revokes already issued refresh tokens unless a token version or blacklist exists.
