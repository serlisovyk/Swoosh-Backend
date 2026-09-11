# Plan: canonical error envelope (MY-39)

See spec: [2026-09-11-canonical-error-envelope.md](../specs/2026-09-11-canonical-error-envelope.md)

## Commit breakdown

1. **`docs(ai): spec + plan for canonical error envelope (MY-39)`** — this spec + this plan. No code.
2. **`feat(errors): add global AllExceptionsFilter for canonical error envelope`**
   - `src/common/errors/{error-codes.constants,errors.constants,errors.types,validation-failed.exception,all-exceptions.filter,index}.ts`.
   - `src/shared/config/validation.config.ts` — `exceptionFactory`.
   - `src/main.ts` — `app.useGlobalFilters(...)`.
   - Manual check: run `npm run start:dev`, hit a few endpoints (bad query on `/products`, bad login body, wrong login credentials, unknown route needs no check — 404 from routing also goes through the filter) and read the raw JSON.
3. **`docs(swagger): document error envelope on error responses`**
   - `src/common/errors/errors.swagger.ts` (`ErrorBodyDocs`, `ErrorResponseDocs`).
   - Add `type: ErrorResponseDocs` to every `ApiBadRequestResponse` / `ApiUnauthorizedResponse` / `ApiForbiddenResponse` / `ApiNotFoundResponse` / `ApiConflictResponse` / `ApiTooManyRequestsResponse` call across the 7 `*.swagger.ts` files that have them (`auth`, `favorites`, `forms/contact-request`, `forms/individual-order`, `forms/newsletter-subscription`, `products`, `user`). Descriptions stay as-is; only `type` is added.
4. **`docs(ai): align rules and decisions with the implemented error envelope`**
   - `ai/rules/architecture.md` — Global Providers (filter exists now) + Error Handling section.
   - `ai/rules/auth-and-api-contracts.md` — drop "not yet implemented" note.
   - `ai/rules/code-conventions.md` — Error handling section.
   - `ai/map.md` — add `common/errors` to the cross-cutting table; drop the "no exception filters" line from "does NOT have".
   - `ai/decisions/2026-09-09-error-envelope-target.md` — `Status: accepted (not implemented)` → `Status: implemented`, note this landed in MY-39.

## Verification

- `npm run lint`
- `npm run build`
- Manual smoke test in step 2 (dev server, a handful of real requests) since there is no test suite.

## Explicitly not doing

- Not touching MY-47/MY-48/MY-49/MY-50 — referenced only as context in the spec.
- Not adding tests.
- Not rewording existing per-module error messages.
