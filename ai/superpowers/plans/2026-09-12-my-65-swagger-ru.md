# Plan: MY-65 — translate remaining Swagger modules to Russian

## Scope

Translate `summary`/`description` text in `ApiOperation` and property decorators
(`ApiProperty`/`ApiPropertyOptional` via the shared factories) to Russian in:

- `src/modules/favorites/favorites.swagger.ts`
- `src/modules/products/products.swagger.ts`
- `src/modules/products/category/product-category.swagger.ts` (already Russian,
  written that way when MY-62 created it — no change needed)
- `src/modules/forms/contact-request/contact-request.swagger.ts`
- `src/modules/forms/individual-order/individual-order.swagger.ts`
- `src/modules/forms/newsletter-subscription/newsletter-subscription.swagger.ts`
- `src/modules/users/users.swagger.ts`

No spec — this only changes documentation text, not any request/response shape,
status code, or `example` value.

## Cross-module structural note

Several files call the shared `ApiNotFoundDocs(entity: string)` helper from
`@common/errors/errors.swagger.ts`, which renders a fixed English template
(`` `${entity} was not found.` ``). That helper itself stays out of scope (it's
shared across every module, not one of the files above, and `auth`'s own
already-translated Swagger doesn't rely on it either). But a call site inside
one of the six files above would keep rendering an English sentence even after
translating everything else in that file — failing the issue's "no English
description string left" bar.

Precedent already exists: `product-category.swagger.ts` (MY-62) never used
`ApiNotFoundDocs` — it writes the 404 case directly as
`ApiNotFoundResponse({ description: '<Russian text>', type: ErrorResponseDocs })`.
Every `ApiNotFoundDocs('...')` call site in the six files is replaced the same
way — same status code, same `type`, only the call form changes from the
shared helper to a direct decorator with a Russian string. This is not a
scope/behavior change, just how the same 404 gets expressed in module-local
text.

Argument-less shared helpers (`ApiAuthRequiredDocs`, `ApiValidationErrorDocs`,
`ApiInvalidQueryDocs`) carry no per-file literal string — their English text
lives entirely in `common/errors` — so they stay untouched, matching how
`auth.swagger.ts` (the reference "done" module) already uses them.

## Commit breakdown

1. This plan (single commit, before any code).
2. `favorites` module translation.
3. `products` module translation (`products.swagger.ts` + the two
   `ApiNotFoundDocs` call sites there).
4. `forms/contact-request` module translation.
5. `forms/individual-order` module translation.
6. `forms/newsletter-subscription` module translation.
7. `users` module translation.
8. Docs: update `ai/rules/code-conventions.md` (Documentation language) and
   `ai/skills/swagger-docs.md` to drop the "other modules are still English
   until touched" caveat — after this issue every module listed in MY-65 is
   translated. `system.swagger.ts` is the one remaining English file, and it's
   not part of this issue's scope — note it explicitly instead of silently
   dropping the caveat.

Each module commit is verified with `bun run lint` / `bun run build` before
moving to the next.

## Explicitly out of scope

- `src/modules/system/system.swagger.ts` — not listed in the issue.
- `common/errors/errors.swagger.ts` shared helper text.
- Any meaning/behavior correction noticed while translating — flagged
  separately, not silently rewritten (per the issue's own risk note).
