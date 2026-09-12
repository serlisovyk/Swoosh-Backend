# Plan: src/common cleanup (MY-42)

No spec — behavior does not change (per the issue's own "Готово когда": no endpoint, no response shape changes). Plan only.

## Verified against current code before touching anything

Three items in the issue no longer match what's on `main` — checked each, no action needed for them:

- **Item 3** (`CookieToken` orphaned after `addSwaggerCookieAuth` removal): false — `addSwaggerCookieAuth` is alive and called from `setupSwagger` (`swagger.config.ts:51`), `CookieToken` is its parameter type. Nothing to delete; deleting it would break the refresh-cookie Swagger auth scheme. Skipped.
- **Item 7** (remove a stale TODO from `createSwaggerOperationId`): no TODO exists anywhere in `src/common` today (grepped). Already gone. Skipped.
- **Item 8** (`getTokenFromResponse` empty-array bug — `token[0]` returning `undefined`): already fixed — `turnstile.utils.ts` already reads `Array.isArray(token) ? (token[0] ?? '') : token || ''`, `Array.isArray` checked first. This was fixed incidentally by the MY-51 strict-mode pass (it was the one real compile error under `noUncheckedIndexedAccess`). Item 6 (the rename) still applies to this same function.

The remaining items are real and still apply as written.

## Remaining items and how they land

1. **Duplicated `api/v1` prefix** — new `src/shared/constants/api.constants.ts`: `API_PREFIX = 'api/v1'`, `SWAGGER_DOCS_PATH = \`${API_PREFIX}/docs\``. `main.ts`'s `app.setGlobalPrefix('api/v1')` → `API_PREFIX`. `swagger.constants.ts`'s own `SWAGGER_PATH = 'api/v1/docs'` is removed entirely (not kept as a re-export) — its 3 use sites in `swagger.config.ts` switch to the shared `SWAGGER_DOCS_PATH`. No other file references `SWAGGER_PATH` (checked, and it isn't in the `@common/swagger` barrel).
2. **Duplicated refresh-cookie-name literal** — `REFRESH_TOKEN_COOKIE_NAME` moves to a new `src/shared/constants/cookie.constants.ts` (no existing shared-constants file fits a cookie name). `auth.constants.ts` re-exports it (`export { REFRESH_TOKEN_COOKIE_NAME } from '@shared/constants'`) so its 3 existing importers (`auth.cookies.ts`, `auth.controller.ts`) don't need path changes. `swagger.constants.ts`'s `SWAGGER_REFRESH_TOKEN_AUTH_NAME` becomes `= REFRESH_TOKEN_COOKIE_NAME` (imported from `@shared/constants`), not an independent literal.
3. Skipped — see above.
4. **`SWAGGER_ACCESS_TOKEN_AUTH_NAME` over-exported** — confirmed only `swagger.config.ts` uses it. Drop it from `src/common/swagger/index.ts`'s barrel re-export; keep the constant itself in `swagger.constants.ts` (still imported directly by `swagger.config.ts` from `../constants`).
5. **Copy-pasted decorator names + `setupSwagger` doing too much**:
   - `swagger.utils.ts`: `ProductsPropertyDocsDecorator` → `PropertyDocsDecorator`, `ProductsOptionalPropertyDocsDecorator` → `OptionalPropertyDocsDecorator` (both are the inner named function expressions returned by the two factories — renaming doesn't change any call site, only what shows up in a stack trace).
   - `swagger.config.ts`: split into `buildSwaggerDocument(app)` (DocumentBuilder + bearer/cookie auth + `SwaggerModule.createDocument`) and `setupSwagger(app, configService)` (the `SWAGGER_ENABLED` gate, basic-auth middleware, calls `buildSwaggerDocument`, then `SwaggerModule.setup`). `buildSwaggerDocument` stays module-private — nothing outside this file needs it, so it isn't added to the barrel.
6. **`getTokenFromResponse` misnamed** — rename to `getCaptchaTokenFromRequest` in `turnstile.utils.ts`; update the one reference in `turnstile.config.ts` (`tokenResponse: getCaptchaTokenFromRequest`, still passed by name, not wrapped in a closure).
7. Skipped — see above.
8. Already fixed — see above; no diff.
9. Covered by item 5's split.
10. **`common/email` has no barrel** — add `src/common/email/index.ts` exporting `EmailModule`, `EmailService`. Fix both existing deep imports: `auth.module.ts` (`@common/email/email.module` → `@common/email`) and `password-reset.service.ts` (`@common/email/email.service` → `@common/email`) — the issue only names the first, but the second is the same violation of the same rule in the same module, so it moves together.
11. **Dead env keys** — `.env.sample` already has none of the listed dead keys (`EMAIL_VERIFICATION_TOKEN_SECRET`, `EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS`, `GOOGLE_CLIENT_ID`/`SECRET`, `GITHUB_CLIENT_ID`/`SECRET`) — already clean, presumably from the MY-46 env-validation pass. The local `.env` (this worktree's copy, and the main checkout's) still has all six — removed from both. `.env` is gitignored, so this produces no commit; noted here only so it isn't silently skipped.

## Commit breakdown

1. `docs(ai): plan for MY-42 common cleanup` — this file, before any code.
2. `refactor(shared): single-source the api prefix, docs path, and refresh-cookie name` — `api.constants.ts`, `cookie.constants.ts`, `main.ts`, `auth.constants.ts`, `swagger.constants.ts`, `swagger.config.ts` (constant swap only, not the split yet).
3. `refactor(swagger): tighten public surface, honest decorator names, split setupSwagger` — items 4, 5, 9.
4. `refactor(captcha): rename getTokenFromResponse to getCaptchaTokenFromRequest` — item 6.
5. `refactor(email): add barrel, drop deep imports` — item 10 (email side).
6. `docs(ai): update map/skills/rules for the common cleanup` — `ai/map.md`, `ai/skills/swagger-docs.md` if the decorator rename needs it, `ai/rules/code-conventions.md` (Constants: state the "lives at the lowest level every consumer can import" rule explicitly, using `API_PREFIX`/`REFRESH_TOKEN_COOKIE_NAME` as the example).

`.env`/`.env.sample` cleanup happens alongside step 2 (touch while already in the area) but isn't its own commit since `.env` isn't tracked and `.env.sample` diff is one line removed... actually `.env.sample` is already clean, so nothing to commit there either — only the two local `.env` files change, outside git.

## Out of scope (per the issue)

- Moving swagger between `common`/`shared`.
- Renaming `turnstile.*` files/module to `captcha.*`.
- Env validation changes (already done in MY-46).

## Verification

- `bun run lint`, `bun run build`.
- Manual check: Swagger UI's Authorize button still sends the `refreshToken` cookie under the same name; `/api/v1/docs` still mounts at the same path.
