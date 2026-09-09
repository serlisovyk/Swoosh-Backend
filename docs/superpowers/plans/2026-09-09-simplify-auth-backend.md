# Simplify Auth Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce Swoosh Server from a fullstack-style, feature-heavy auth setup to a simpler standalone NestJS backend with JWT email/password auth, refresh-token HttpOnly cookie, access token returned in responses, no email verification, no Google/GitHub OAuth, and no server-side auth sessions.

**Architecture:** Keep the NestJS module layout, Mongoose models, Swagger wrappers, and DTO/service/controller boundaries. Simplify auth in small commits so each behavior change is independently reviewable and revertable. Treat `server` as the product boundary for this work: frontend breakage is expected and out of scope until a separate client plan starts.

**Tech Stack:** NestJS 11, TypeScript, MongoDB/Mongoose, Passport JWT, @nestjs/jwt, @nestjs/swagger, Cloudflare Turnstile, Resend email for password reset only.

## Current Project Analysis

- The backend is a NestJS API under `server` with global prefix `/api/v1`.
- Core infrastructure: MongoDB via Mongoose, global validation pipe, Swagger at `/api/v1/docs`, Helmet, CORS with credentials, cookie parser, global throttler, Turnstile.
- Modules:
  - `auth`: register/login/logout/refresh, password reset, email verification, Google/GitHub OAuth, server-side auth sessions.
  - `user`: profile read/update, address model, password/email update logic, currently blocks profile updates when `isEmailVerified=false`.
  - `products`: public product catalog and admin CRUD.
  - `favorites`: authenticated favorite-product operations.
  - `forms`: contact requests, individual orders, newsletter subscriptions.
- Auth is currently overbuilt for the requested product direction:
  - access and refresh tokens are both set as HttpOnly cookies.
  - refresh tokens are tied to stored `AuthSession` documents with user-agent/IP metadata.
  - user model stores `googleId`, `githubId`, `isEmailVerified`, `emailVerificationToken`, and `emailVerificationTokenExpiresAt`.
  - OAuth adds strategies, guards, decorators, social controller/service, env vars, Swagger docs, and frontend routes/buttons.
  - email verification adds DTO, template, account endpoints, user gating, env vars, constants, Swagger docs, and frontend pages/notices.
- Parent repo docs and skills currently describe this as a fullstack project and still instruct future agents to preserve cookie-based access auth, OAuth, email verification, and server-side sessions. For this backend effort, copy and rewrite the backend-relevant surfaces into `server` instead of preserving the fullstack assumptions.

## Backend-Only Scope

- Do not edit `../client` during this plan.
- Do not preserve backend behavior just because the current frontend depends on it.
- Do not verify frontend checks during this plan.
- Do make `server` internally coherent: runtime code, Swagger, `.env.sample`, README, `AGENTS.md`, docs/rules, and server-local skills must all describe the same backend contract.
- Do keep root fullstack docs out of the critical path unless they block the server from standing alone. Root cleanup can happen later when the repo split strategy is clearer.

## Strategic Decisions To Confirm

- Access token transport: backend should return `accessToken` in register/login/refresh response body; protected endpoints should read `Authorization: Bearer <token>`, not access-token cookie.
- Refresh token transport: backend should keep only `refreshToken` in an HttpOnly cookie.
- Refresh behavior without sessions: refresh token should be stateless JWT. This removes server-side logout-all/device/session management and refresh reuse detection. Logout clears the cookie but cannot revoke an already issued refresh token unless a blacklist is added.
- Email verification: new users are effectively verified by default because verification no longer exists. Best implementation is to remove `isEmailVerified` from public contract and backend gating, not keep it permanently `true`.
- Existing MongoDB data: removing fields from Mongoose schema does not delete fields already stored in MongoDB. Add a small cleanup script or documented migration to unset legacy fields.
- Password reset stays unless explicitly removed. It still needs Resend email, reset token fields, and `AuthAccountService`.

## Commit Plan

### Commit 1: Simplify Runtime JWT Contract

**Intent:** Change runtime auth so access tokens are returned in the response body and accepted via Bearer auth, while refresh stays in an HttpOnly cookie.

**Files:**
- Modify: `src/modules/auth/auth.service.ts`
- Modify: `src/modules/auth/auth.controller.ts`
- Modify: `src/modules/auth/strategies/jwt.strategy.ts`
- Modify: `src/modules/auth/auth.utils.ts`
- Modify: `src/modules/auth/auth.types.ts`
- Modify: `src/modules/auth/auth.constants.ts`
- Modify: `src/common/swagger/config/swagger.config.ts`
- Modify: `src/common/swagger/utils/swagger.utils.ts`
- Modify: `src/common/swagger/constants/swagger.constants.ts`
- Test: add focused auth service/controller tests if the current test setup supports them cleanly.

**Steps:**
- [ ] Add failing tests or minimal smoke tests for register/login/refresh returning `accessToken` in JSON and setting only `refreshToken` as HttpOnly cookie.
- [ ] Change `setAuthTokens` into refresh-cookie-only helpers, for example `setRefreshTokenCookie()` and `clearRefreshTokenCookie()`.
- [ ] Stop setting `ACCESS_TOKEN_COOKIE_NAME`; remove the constant unless still needed for cleanup compatibility.
- [ ] Update `AuthController.register`, `login`, and `newTokens` so returned payload includes `accessToken` and `user`.
- [ ] Change `JwtStrategy` to use `ExtractJwt.fromAuthHeaderAsBearerToken()`.
- [ ] Remove `extractAccessTokenFromCookie()` if no longer used.
- [ ] Update Swagger security from access cookie auth to Bearer auth; keep refresh cookie auth only for `/auth/new-tokens` and `/auth/logout`.
- [ ] Run `npm run lint` and `npm run test` from `server`.

**Commit:** `refactor(auth): return access tokens and keep refresh cookie only`

### Commit 2: Remove Auth Sessions

**Intent:** Delete OAuth/auth session overhead and simplify refresh/logout behavior.

**Files:**
- Delete: `src/modules/auth/auth-session.controller.ts`
- Delete: `src/modules/auth/auth-session/auth-session.service.ts`
- Delete: `src/modules/auth/auth-session/auth-session.utils.ts`
- Delete: `src/modules/auth/auth-session/models/auth-session.model.ts`
- Modify: `src/modules/auth/auth.module.ts`
- Modify: `src/modules/auth/auth.service.ts`
- Modify: `src/modules/auth/auth.types.ts`
- Modify: `src/modules/auth/auth.swagger.ts`
- Modify: `package.json` only if dependencies become unused after later commits, not here unless confirmed.

**Steps:**
- [ ] Remove `AuthSession` Mongoose registration and `AuthSessionService` provider from `AuthModule`.
- [ ] Remove session creation, session lookup, token hash matching, token rotation storage, `logoutAll`, `revokeSession`, and `getSessions`.
- [ ] Generate refresh tokens without `jti`, or keep `jti` only if there is a clear stateless reason. Prefer removing it for simplicity.
- [ ] Make `getNewTokens()` validate refresh JWT, fetch the user by id, and issue a fresh access token plus refresh token.
- [ ] Make `logout()` no-op at service level or remove the service method if the controller only clears the cookie.
- [ ] Remove session response docs and endpoint docs from `auth.swagger.ts`.
- [ ] Run `npm run lint` and `npm run test`.

**Commit:** `refactor(auth): remove server-side auth sessions`

### Commit 3: Remove Google/GitHub OAuth

**Intent:** Keep only email/password JWT auth.

**Files:**
- Delete: `src/modules/auth/social-auth/social-auth.controller.ts`
- Delete: `src/modules/auth/social-auth/social-auth.service.ts`
- Delete: `src/modules/auth/strategies/google.strategy.ts`
- Delete: `src/modules/auth/strategies/github.strategy.ts`
- Delete: `src/modules/auth/guards/google-auth.guard.ts`
- Delete: `src/modules/auth/guards/github-auth.guard.ts`
- Delete: `src/modules/auth/decorators/google-auth.decorator.ts`
- Delete: `src/modules/auth/decorators/github-auth.decorator.ts`
- Modify: `src/modules/auth/auth.module.ts`
- Modify: `src/modules/auth/auth.service.ts`
- Modify: `src/modules/auth/auth.types.ts`
- Modify: `src/modules/auth/auth.constants.ts`
- Modify: `src/modules/auth/auth.swagger.ts`
- Modify: `src/modules/user/user.service.ts`
- Modify: `src/modules/user/models/user.model.ts`
- Modify: `src/modules/user/user.constants.ts`
- Modify: `.env.sample`
- Modify: `package.json`

**Steps:**
- [ ] Remove OAuth controllers, guards, strategies, decorators, service, constants, and types.
- [ ] Remove `socialLogin()`, `resolveSocialUser()`, `createSocialUser()`, `linkSocialProvider()`, `getBySocialProvider()`, and social provider helper logic.
- [ ] Remove `googleId` and `githubId` from the user schema and sensitive-field types.
- [ ] Remove `passport-google-oauth20`, `passport-github2`, and their type packages from `package.json`.
- [ ] Remove Google/GitHub env vars from `.env.sample`.
- [ ] Remove OAuth Swagger docs.
- [ ] Run dependency install/update only after approval if lockfile changes are needed.
- [ ] Run `npm run lint` and `npm run test`.

**Commit:** `refactor(auth): remove social oauth`

### Commit 4: Remove Email Verification

**Intent:** Delete email verification entirely and stop gating profile updates on verified email.

**Files:**
- Delete: `src/common/email/templates/verify-email.template.tsx`
- Delete: `src/modules/auth/auth-account/dto/verify-email.dto.ts`
- Modify: `src/common/email/email.service.ts`
- Modify: `src/common/email/email.types.ts`
- Modify: `src/modules/auth/auth.service.ts`
- Modify: `src/modules/auth/auth-account/auth-account.controller.ts`
- Modify: `src/modules/auth/auth-account/auth-account.service.ts`
- Modify: `src/modules/auth/auth.constants.ts`
- Modify: `src/modules/auth/auth.swagger.ts`
- Modify: `src/modules/auth/auth.types.ts`
- Modify: `src/modules/user/user.controller.ts`
- Modify: `src/modules/user/user.service.ts`
- Modify: `src/modules/user/models/user.model.ts`
- Modify: `src/modules/user/user.swagger.ts`
- Modify: `.env.sample`

**Steps:**
- [ ] Stop calling `requestEmailVerification()` during registration.
- [ ] Remove request-email-verification and verify-email endpoints.
- [ ] Remove email verification token methods from `UserService`.
- [ ] Remove `isEmailVerified`, `emailVerificationToken`, and `emailVerificationTokenExpiresAt` from the user schema and public user docs.
- [ ] Remove profile update gating based on `isEmailVerified`.
- [ ] Remove verify-email email template and send method.
- [ ] Remove `EMAIL_VERIFICATION_TOKEN_SECRET` and `EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS` from `.env.sample`.
- [ ] Update Swagger descriptions for register/login to no longer mention verification.
- [ ] Run `npm run lint` and `npm run test`.

**Commit:** `refactor(auth): remove email verification`

### Commit 5: Add Legacy Mongo Cleanup

**Intent:** Provide an explicit path to remove obsolete fields from existing MongoDB documents.

**Files:**
- Create: `scripts/cleanup-auth-simplification.ts` or a repo-consistent migration location if one exists by then.
- Modify: `package.json` with a targeted script if appropriate.
- Modify: `README.md` or backend docs with one short migration note.

**Steps:**
- [ ] Add a script that unsets `googleId`, `githubId`, `isEmailVerified`, `emailVerificationToken`, and `emailVerificationTokenExpiresAt` from `users`.
- [ ] Add a script step to drop the `authsessions` collection if it exists.
- [ ] Make the script idempotent and print counts/collection actions.
- [ ] Do not run the script against real data without explicit approval.
- [ ] Run TypeScript/lint checks.

**Commit:** `chore(db): add cleanup for removed auth fields`

### Commit 6: Normalize Repeated Text Constants

**Intent:** Replace the old "constant for every string" habit with "constant only when reused or semantically central."

**Files:**
- Modify module constants and DTO/controller/service files across `src/modules/auth`, `src/modules/user`, `src/modules/products`, `src/modules/favorites`, and `src/modules/forms`.

**Steps:**
- [ ] Inventory constants used exactly once.
- [ ] Keep repeated messages, shared examples, route names, cookie names, throttling configs, and domain constants.
- [ ] Inline one-off validation messages, Swagger descriptions, and one-off examples where it improves local readability.
- [ ] Avoid huge mechanical churn in unrelated modules unless the one-off constants are genuinely noisy.
- [ ] Run `npm run lint`.

**Commit:** `refactor: inline one-off text constants`

### Commit 7: Add Backend AI Docs Workspace

**Intent:** Create a backend-local planning/docs area so future work can run through specs and implementation plans inside the server project.

**Files:**
- Create: `docs/ai/README.md`
- Create: `docs/ai/specs/README.md`
- Create: `docs/ai/plans/README.md`
- Create: `docs/ai/decisions/README.md`
- Create: `docs/ai/reviews/README.md`
- Optional create: `docs/ai/templates/spec-template.md`
- Optional create: `docs/ai/templates/plan-template.md`

**Steps:**
- [ ] Define `docs/ai/specs` for product/technical specs that say what should change and why.
- [ ] Define `docs/ai/plans` for step-by-step implementation plans approved before code work.
- [ ] Define `docs/ai/decisions` for durable ADR-style decisions, such as "JWT access token uses Bearer auth".
- [ ] Define `docs/ai/reviews` for post-implementation reviews and verification notes.
- [ ] Keep templates concise and backend-specific.
- [ ] Update `AGENTS.md` later in Commit 8 so agents know to use this workspace.

**Commit:** `docs: add backend ai planning workspace`

### Commit 8: Convert Server Docs To Backend-Only

**Intent:** Make `server` able to stand alone as the backend project.

**Files:**
- Create/modify: `README.md` in `server`
- Modify: `AGENTS.md` in `server`
- Create: `docs/rules/backend-architecture.md` in `server`
- Create: `docs/rules/auth-and-api-contracts.md` in `server`
- Create: `docs/rules/code-conventions.md` in `server` if backend-specific TypeScript rules are still needed.
- Do not move frontend docs into `server`.

**Steps:**
- [ ] Rewrite `server/README.md` as backend-only setup: stack, env, install, start, Swagger URL, auth contract, migration note.
- [ ] Rewrite `server/AGENTS.md` so it references local `docs/rules/...`, not parent fullstack docs.
- [ ] Copy and trim backend-relevant rule files from parent `docs/rules`.
- [ ] Remove stale requirements about OAuth, email verification, server-side sessions, and access-token cookies.
- [ ] State the new auth contract: Bearer access token, HttpOnly refresh cookie.
- [ ] Keep password reset and Turnstile rules if those flows remain.
- [ ] Reference `docs/ai` as the default place for backend specs, plans, decisions, and reviews.

**Commit:** `docs: make server instructions backend-only`

### Commit 9: Move And Update Backend Skills

**Intent:** Put backend-relevant repo skills under `server/.codex/skills` and remove stale fullstack assumptions from those skills.

**Files:**
- Create/update: `server/.codex/skills/swoosh-auth-flow/SKILL.md`
- Create/update: `server/.codex/skills/swoosh-backend-module/SKILL.md`
- Create/update: `server/.codex/skills/nestjs-swagger-docs/SKILL.md`
- Create/update: `server/.codex/skills/swoosh-backend-review/SKILL.md`
- Create/update: `server/.codex/skills/swoosh-backend-security-review/SKILL.md`
- Create/update: `server/.codex/skills/swoosh-backend-performance-review/SKILL.md`
- Create/update: `server/.codex/skills/swoosh-query-filters/SKILL.md`
- Optional remove/move from root only after deciding whether the parent repo will remain.

**Steps:**
- [ ] Copy only backend skills from parent `.codex/skills`.
- [ ] Update `swoosh-auth-flow` to remove frontend, OAuth, email verification, and server-side auth session assumptions.
- [ ] Update `nestjs-swagger-docs` to prefer Bearer auth for access-token protected endpoints and refresh cookie docs only where runtime uses the refresh cookie.
- [ ] Update backend review/security/performance skills to reference `server/docs/rules`.
- [ ] Keep frontend skills out of the server project.

**Commit:** `docs: move backend skills into server`

## Explicitly Deferred Work

- Frontend auth, profile, route, and API-client changes are intentionally deferred.
- Root monorepo cleanup is deferred unless it directly prevents server-local docs or skills from working.
- Frontend token storage strategy is deferred. Backend will expose a clean Bearer-access-token plus refresh-cookie contract; the client can adapt later.

## Suggested New Backend Skills

- `swoosh-backend-auth-jwt`: focused on JWT-only auth contracts, refresh cookie behavior, Bearer guards, logout limitations, and Swagger alignment.
- `swoosh-backend-cleanup`: for removing features safely: dependency removal, env cleanup, Swagger cleanup, model field cleanup, migration notes, and tests.
- `swoosh-backend-migrations`: for one-off Mongo cleanup scripts and idempotent data migrations.
- `swoosh-backend-docs-maintenance`: for keeping backend README, AGENTS, rules, and server-local skills aligned after architectural changes.

## Verification Strategy

- Run from `server`: `npm run lint`.
- Run from `server`: `npm run test` when logic changes.
- Run `npm run build` after deleting modules/dependencies.
- Inspect generated Swagger mentally or via local Swagger UI after contract changes.
- For dependency removals, update lockfile through the package manager the repo standardizes on before final verification.

## Approval Checkpoints

- Approve or change the JWT decision: Bearer access token plus refresh HttpOnly cookie.
- Confirm whether password reset stays. This plan assumes it stays.
- Confirm whether to add a Mongo cleanup script. This plan recommends yes.
- Confirm whether the `docs/ai` workspace name is acceptable, or whether it should be `docs/agent`, `docs/work`, or another name.
