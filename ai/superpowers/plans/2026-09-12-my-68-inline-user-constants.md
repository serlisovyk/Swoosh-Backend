# Plan: Inline one-off user constants, collapse select-fields alias, drop leading slash

Linear: MY-68

No spec — behavior-neutral cleanup, same rule already applied to
`auth`/MY-56, `favorites`/MY-57, `forms`/MY-61, `products`/MY-64. Only
observable change: the request path stays `/api/v1/profile` either way
(Express/Nest normalize a leading slash in `@Controller()` the same as no
slash), and no error text or Swagger example changes.

## Audit (occurrence count, not just file count)

- **Inline** (single-occurrence DTO validation message):
  `EMAIL_STRING_ERROR`, `EMAIL_FORMAT_ERROR`, `NEW_PASSWORD_STRING_ERROR`,
  `NEW_PASSWORD_LENGTH_ERROR`, `NAME_STRING_ERROR`, `PHONE_STRING_ERROR`,
  `CURRENT_PASSWORD_STRING_ERROR` (all in `update-user.dto.ts`); all six
  `ADDRESS_*_STRING_ERROR` (in `update-user-address.dto.ts`).
- **Inline** (Swagger examples): all ten `USER_*_EXAMPLE` /
  `USER_ADDRESS_*_EXAMPLE` constants, per the issue's explicit instruction —
  each is used twice in `users.swagger.ts` (an "optional" and a "required"
  property-docs variant for the same field), so inlining duplicates the
  literal in both, same tradeoff the issue accepts.
- **Keep as constants**: `USER_ALREADY_EXISTS_ERROR` (3 throw sites in
  `users.service.ts`), `USER_NOT_FOUND_ERROR` (reused by
  `favorites.service.ts`), `CURRENT_PASSWORD_REQUIRED_ERROR` and
  `WRONG_CURRENT_PASSWORD_ERROR` (service-thrown, not DTO messages — same
  precedent as `FAVORITES_UPDATE_CONFLICT_ERROR` staying a constant in
  `favorites.constants.ts` despite being single-use).
- **Delete as dead code** (found during the audit, not listed in the issue):
  `PASSWORD_STRING_ERROR` in `users.constants.ts` — same text as
  `auth.constants.ts`'s own `PASSWORD_STRING_ERROR`, but nothing imports the
  `users` copy; `update-user.dto.ts` uses `NEW_PASSWORD_STRING_ERROR` /
  `CURRENT_PASSWORD_STRING_ERROR` instead. A stale leftover, safe to remove
  along with everything else touched in this file.
- Also note: `NAME_STRING_ERROR` and `PHONE_STRING_ERROR` exist as separate,
  differently-scoped constants in both `auth.constants.ts` and
  `users.constants.ts` with identical Russian text. That cross-module
  duplication is pre-existing and out of scope here — MY-68 only touches
  `users.constants.ts`'s own copy (single-use in `update-user.dto.ts`).

## USER_PUBLIC_SELECT_FIELDS / USER_BASE_SELECT_FIELDS

Collapse into one constant, `USER_SELECT_FIELDS`. No documented intent
anywhere (code, comments, decisions) to let public/base diverge later, and
`password`/`resetPasswordToken`/`resetPasswordTokenExpiresAt` are already
`select: false` at the schema level — this string only ever excludes
timestamps/`__v`. A silent alias with zero difference is the thing to fix,
not preserve with a speculative comment for a divergence nobody has planned.

## Controller path

`@Controller('/profile')` → `@Controller('profile')` — matches every other
controller in the repo (`products`, `auth`, etc., no leading slash).

## Commit breakdown

1. **docs(ai): plan for MY-68 inline user constants** — this plan, alone (no
   spec), before any code.

2. **refactor(users): inline one-off constants, collapse select-fields alias, drop leading slash**
   - `users.constants.ts` — remove every inlined constant and the dead
     `PASSWORD_STRING_ERROR`; collapse `USER_BASE_SELECT_FIELDS`/
     `USER_PUBLIC_SELECT_FIELDS` into `USER_SELECT_FIELDS`.
   - `update-user.dto.ts`, `update-user-address.dto.ts` — inline the
     validation messages directly into their decorators.
   - `users.swagger.ts` — inline the ten example values; drop the now-unused
     import.
   - `users.service.ts` — use `USER_SELECT_FIELDS` at all four call sites.
   - `users.controller.ts` — `@Controller('profile')`.

## Verification

- `bun run lint`
- `bun run build`
- Diff every remaining validation-error string and Swagger example against
  its pre-change text — byte-for-byte identical.
- Manual check: `GET /api/v1/profile` and `PUT /api/v1/profile` still resolve
  (path normalization confirmed, not just assumed).
