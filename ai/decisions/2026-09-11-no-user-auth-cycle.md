# Break the `user` ↔ `auth` module cycle

Date: 2026-09-11 · Status: implemented (MY-54)

## Context

`auth` legitimately depends on `user` (`AuthService` calls `UserService` to register/authenticate). But `user` also imported from `auth`: `user.service.ts` took `RegisterDto` (an `auth` DTO) as `UserService.create`'s parameter type, and imported `hashTokenWithSecret` from `auth.utils.ts`. That's a bidirectional dependency between two domain modules — a change to `auth`'s request shape could break `user` with no obvious reason why, and neither module can be reasoned about in isolation.

## Decision

- `UserService.create` takes a module-owned `CreateUserInput` (`src/modules/user/user.types.ts`: `email`, `password`, `name?`, `phone?`) instead of `auth`'s `RegisterDto`. `AuthService.register` maps `RegisterDto` → `CreateUserInput` before calling it.
- `generateToken`/`hashTokenWithSecret` moved out of `auth.utils.ts` into `src/shared/utils/crypto.utils.ts` — they're pure crypto functions with no domain meaning, so `shared` is the correct home, not `auth` or `user`.
- Net result: `user` imports nothing from `auth`. `auth` imports from `user` (one direction only).

## Consequences

- Any future feature module that needs to create a user should shape its own input into `CreateUserInput`, not add new optional fields to it for its own convenience — that would start re-coupling `user` to whichever module invented the field.
- This is now a standing rule (`ai/rules/architecture.md`): no bidirectional dependency between feature modules. If a review finds one, it's a bug to fix, not a pattern to extend.
