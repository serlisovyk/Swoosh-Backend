# Plan: MY-56 auth cleanup — inline one-off constants, dedup DTO, guard/decorator fixes

No spec — no behavior or text changes; error strings and Swagger examples move verbatim, no wording touched.

## 1. Inline one-off constants (literal values unchanged)

`auth.constants.ts` → inline at their single call site, then delete from the file:
- `FAILED_TO_CREATE_USER_ERROR` → `auth.service.ts` (`register`)
- `USER_NOT_FOUND_ERROR` → `auth.service.ts` (`getNewTokens`) — this is a *different* constant from `users.constants.ts`'s same-named one; not touched, different text, different module
- `INVALID_REFRESH_TOKEN_ERROR` → `auth.service.ts` (`getNewTokens`)
- `REFRESH_TOKEN_MISSING_ERROR` → `auth.controller.ts` (`newTokens`)
- `NAME_STRING_ERROR`, `PHONE_STRING_ERROR` → `register.dto.ts` (moving into the class body directly, not into the new base DTO — see §3)
- `AUTH_EMAIL_EXAMPLE`, `AUTH_PASSWORD_EXAMPLE`, `AUTH_NAME_EXAMPLE`, `AUTH_PHONE_EXAMPLE` → `auth.swagger.ts`

`password-reset.constants.ts` → inline at their single call site, then delete (issue's list names `auth.constants.ts`, but these four moved to `password-reset.constants.ts` in MY-54, after the issue was written — same rule, same file that would have held them otherwise):
- `TOKEN_NOT_EMPTY_ERROR`, `TOKEN_STRING_ERROR` → `reset-password.dto.ts`
- `INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR` → `password-reset.service.ts`
- `AUTH_RESET_TOKEN_EXAMPLE` → `password-reset.swagger.ts`

Kept as constants (per issue, unchanged): `INVALID_CREDENTIALS_ERROR`, `EMAIL_VALIDATION_ERROR`, `PASSWORD_STRING_ERROR`, `PASSWORD_MIN_LENGTH_ERROR`, `REFRESH_TOKEN_COOKIE_NAME` (re-export), both `AUTH_*_THROTTLE` in `auth.constants.ts`, `RESET_PASSWORD_URL` and both `AUTH_PASSWORD_RESET*_THROTTLE` in `password-reset.constants.ts`.

## 2. `request-password-reset.dto.ts`

Drop `@IsNotEmpty`/`@IsString` (same message as `@IsEmail`, which already implies both) — keep `@IsEmail({}, { message: EMAIL_VALIDATION_ERROR })` alone.

## 3. Dedup `favoriteProductIds`

New `src/modules/auth/dto/favorite-product-ids.dto.ts`: a `FavoriteProductIdsDto` class holding only the `favoriteProductIds?` field (all four validators + the Swagger decorator, moved verbatim). `LoginDto`/`RegisterDto extends FavoriteProductIdsDto`, keeping their own `email`/`password`(/`name`/`phone`) fields — narrow inheritance, nothing else rides along.

## 4. Guard/decorator fixes (`ai/rules/code-conventions.md` compliance, no behavior change)

- `auth.constants.ts`: add `ROLES_METADATA_KEY = 'roles'`.
- `decorators/roles.decorator.ts`: `SetMetadata(ROLES_METADATA_KEY, roles)` instead of the literal `'roles'`.
- `guards/roles.guard.ts`: `reflector.getAllAndOverride<ROLES[]>(ROLES_METADATA_KEY, ...)`; `private reflector` → `private readonly reflector`.
- `guards/jwt.guard.ts`: add `@Injectable()` to `JwtAuthGuard` (matches `RolesGuard`).
- `decorators/user.decorator.ts`: `data: keyof UserWithoutPassword` → `data?: keyof UserWithoutPassword` (the runtime already handles the no-argument call; the type was lying). Checked both call shapes exist today (`@CurrentUser()` and `@CurrentUser('_id')`) — the wider type covers both, `bun run build` is the actual check.

## Commits

1. plan (this commit)
2. `refactor(auth): inline one-off constants and Swagger examples` — §1
3. `refactor(auth): drop redundant validators, dedup favoriteProductIds DTO` — §2, §3
4. `refactor(auth): shared roles metadata key, readonly reflector, consistent guard/decorator typing` — §4
5. `docs: point to auth as the constants-inlining reference` — `ai/rules/code-conventions.md` Constants section

## Verification

- `bun run lint`, `bun run build`.
- Diff every inlined string against its constant definition before deleting the constant — byte-for-byte, no wording drift.
- Manual: register/login/new-tokens/logout/request-password-reset/reset-password error responses unchanged; `favoriteProductIds` validation behaves identically on both `register` and `login`.
