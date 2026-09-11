# Plan: shared Swagger helpers for repeated responses (MY-59)

Issue: [MY-59](https://linear.app/my-workspace-5105/issue/MY-59/obshie-swagger-helpery-dlya-povtoryayushihsya-otvetov)
Branch: `my-59-swagger-response-helpers`

Spec: not needed — pure documentation relayout, no behavior or contract change.

## Location decision

MY-59's own risk section says to do this **after** MY-44 (moving swagger infra to `shared/swagger`), otherwise the helpers land in `common/swagger` and need a second move. MY-44 is still Todo (`src/shared/swagger` does not exist yet). Confirmed with the author: place the new helpers in `src/common/swagger/` now, accept that MY-44 will move them later along with everything else already there.

## Audit — which texts are actually byte-identical (not the issue's illustrative examples)

Read all seven `*.swagger.ts` files first. Only replace description text that is byte-for-byte identical in 2+ places; leave everything else untouched, per the issue's "no blind generalization" rule.

- **`ApiUnauthorizedResponse` — "Authentication is required."** — identical in `favorites` (3), `products` (3), `user` (1, `GetProfile` only — `UpdateProfileDocs` has different text), `contact-request` (4), `individual-order` (4), `newsletter-subscription` (4). 19 occurrences → `ApiAuthRequiredDocs()`.
- **`ApiBadRequestResponse` — "Request body validation failed."** — identical in `auth` (3: Register/Login/RequestPasswordReset), `contact-request`/`individual-order`/`newsletter-subscription`/`products` Create (1 each). 7 occurrences → `ApiValidationErrorDocs()`.
- **`ApiBadRequestResponse` — "One or more query parameters are invalid."** — identical in `favorites`, `products`, and all three `forms/*` FindAll (5 total) → `ApiInvalidQueryDocs()`.
- **`ApiNotFoundResponse`** — the issue's own example text ("Individual order was not found.") does not match the actual file text ("Individual order with the provided id was not found.") — trusting the file, not the issue prose. One parameterized helper `ApiNotFoundDocs(entity: string)` covers every duplicated case by passing the full entity phrase:
  - `ApiNotFoundDocs('User')` — favorites FindAll + Remove (2×, "User was not found.")
  - `ApiNotFoundDocs('Product with the provided id')` — products FindById + Delete (2×)
  - `ApiNotFoundDocs('Contact request with the provided id')` — contact-request FindById/Update/Delete (3×)
  - `ApiNotFoundDocs('Individual order with the provided id')` — individual-order FindById/Update/Delete (3×)
  - `ApiNotFoundDocs('Newsletter subscription with the provided id')` — newsletter-subscription FindById/Update/Delete (3×)
- **`ApiForbiddenResponse`** — every occurrence is a distinct, per-action/per-entity text ("Only admins can create products." vs "...update products." vs "...access contact requests." etc). None matches the issue's proposed fixed text ("Insufficient permissions.") anywhere in the repo. Per the issue's own fallback ("if it diverges anywhere, don't generalize that text"), **no Forbidden helper is added** — all `ApiForbiddenResponse` calls stay untouched.
- **Not touched (single occurrence each, not a duplicate):** favorites "User or product was not found." (Add), products "Product category was not found." (Create) and "Product or category was not found." (Update), auth "User for the refresh token was not found." (NewTokens), user's `UpdateProfileDocs` unauthorized text, all `ApiConflictResponse` calls.

## Commit breakdown

1. `docs(ai): add plan for MY-59` — this file, before code.
2. `feat(swagger): add shared response-doc helpers for repeated Api*Response text`
   - New `src/common/swagger/common-responses.swagger.ts`: `ApiAuthRequiredDocs()`, `ApiValidationErrorDocs()`, `ApiInvalidQueryDocs()`, `ApiNotFoundDocs(entity: string)` — each wraps the matching `Api*Response` with `type: ErrorResponseDocs` (per `ai/skills/swagger-docs.md`'s existing rule) and the exact text audited above.
   - Export the four from `src/common/swagger/index.ts`.
3. `refactor(swagger): use shared response helpers in auth/products/user`
   - `auth.swagger.ts`: 3× `ApiValidationErrorDocs()`.
   - `products.swagger.ts`: 3× `ApiAuthRequiredDocs()`, 1× `ApiInvalidQueryDocs()`, 1× `ApiValidationErrorDocs()`, 2× `ApiNotFoundDocs('Product with the provided id')`.
   - `user.swagger.ts`: 1× `ApiAuthRequiredDocs()` (GetProfile only).
4. `refactor(swagger): use shared response helpers in favorites`
   - `favorites.swagger.ts`: 3× `ApiAuthRequiredDocs()`, 1× `ApiInvalidQueryDocs()`, 2× `ApiNotFoundDocs('User')`.
5. `refactor(swagger): use shared response helpers in forms modules`
   - `contact-request.swagger.ts`, `individual-order.swagger.ts`, `newsletter-subscription.swagger.ts`: same four substitutions per file (Auth required ×4 each, invalid query ×1 each, validation failed ×1 each, not-found-with-id ×3 each).
6. `docs(ai): document shared Swagger response helpers`
   - `ai/skills/swagger-docs.md`: new "Repeated responses" section — what the four helpers are, when to use them, and the explicit "Forbidden text diverges everywhere, do not generalize it" note.
   - `ai/map.md`: mention `common-responses.swagger.ts` in the `swagger` package row.

## Risks / invariants

- Every replacement must keep the exact same `description` string and the same `type: ErrorResponseDocs` — this is a pure relayout, not a wording change.
- Do not touch `ApiForbiddenResponse`, `ApiConflictResponse`, or any single-occurrence text — out of scope per the audit above.
- `npm run build` is mandatory (touches 7+ files) to catch a missed import.

## Verification

- `npm run lint`
- `npm run build`
- Manual read of the generated OpenAPI JSON (or `/api/v1/docs`) for one endpoint per touched file to confirm response descriptions/status codes are unchanged.
