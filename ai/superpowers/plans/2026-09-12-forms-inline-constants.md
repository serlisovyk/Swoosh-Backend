# Plan: forms inline single-use constants, selectFields, unify create() (MY-61)

## Goal

After MY-60, each form module's `*.constants.ts` still holds several error-message constants that
are used at exactly one call site. Inline those, per the pattern already applied in MY-56 (auth) and
MY-57 (favorites). Also inline the `selectFields = '-__v'` service field (same MY-57 precedent), and
unify the three modules' `create()` response per
`ai/superpowers/specs/2026-09-12-forms-unify-create-response.md`.

## Usage audit (actual call-site counts, verified by grep before writing this plan)

**contact-request** — inline (each used at exactly one call site, `create-contact-request.dto.ts`,
via `PartialType` in the update DTO so there's no second site):
`CONTACT_REQUEST_NAME_STRING_ERROR`, `CONTACT_REQUEST_NAME_EMPTY_ERROR`,
`CONTACT_REQUEST_NAME_MAX_LENGTH_ERROR`, `CONTACT_REQUEST_EMAIL_STRING_ERROR`,
`CONTACT_REQUEST_EMAIL_EMPTY_ERROR`, `CONTACT_REQUEST_EMAIL_FORMAT_ERROR`,
`CONTACT_REQUEST_MESSAGE_STRING_ERROR`, `CONTACT_REQUEST_MESSAGE_MAX_LENGTH_ERROR`,
`CONTACT_REQUEST_SORT_ERROR` (single site, `find-all-contact-requests.dto.ts`).
Keep: `CONTACT_REQUEST_NOT_FOUND_ERROR` (4 sites in the service), `CONTACT_REQUEST_ID_EXAMPLE`
(5 sites in Swagger), `DEFAULT_CONTACT_REQUESTS_LIMIT` (shared list-query default, MY-60).

**individual-order** — inline: `INDIVIDUAL_ORDER_NAME_STRING_ERROR`,
`INDIVIDUAL_ORDER_NAME_EMPTY_ERROR`, `INDIVIDUAL_ORDER_NAME_MAX_LENGTH_ERROR`,
`INDIVIDUAL_ORDER_PHONE_STRING_ERROR`, `INDIVIDUAL_ORDER_PHONE_EMPTY_ERROR`,
`INDIVIDUAL_ORDER_PHONE_FORMAT_ERROR`, `INDIVIDUAL_ORDER_EMAIL_STRING_ERROR`,
`INDIVIDUAL_ORDER_EMAIL_EMPTY_ERROR`, `INDIVIDUAL_ORDER_EMAIL_FORMAT_ERROR`,
`INDIVIDUAL_ORDER_MESSAGE_STRING_ERROR`, `INDIVIDUAL_ORDER_MESSAGE_MAX_LENGTH_ERROR` (all single-site
in `create-individual-order.dto.ts`), `INDIVIDUAL_ORDER_SORT_ERROR` (single site).
Keep: `INDIVIDUAL_ORDER_STATUS_ERROR` (two real sites — the `status` query filter in
`find-all-individual-orders.dto.ts` and the `status` field in `update-individual-order.dto.ts`, which
adds it fresh rather than inheriting it), `INDIVIDUAL_ORDER_NOT_FOUND_ERROR` (4 sites),
`INDIVIDUAL_ORDER_ID_EXAMPLE` (5 sites), `DEFAULT_INDIVIDUAL_ORDERS_LIMIT`.

**newsletter-subscription** — inline: `NEWSLETTER_SUBSCRIPTION_EMAIL_STRING_ERROR`,
`NEWSLETTER_SUBSCRIPTION_EMAIL_EMPTY_ERROR`, `NEWSLETTER_SUBSCRIPTION_EMAIL_FORMAT_ERROR` (single
site, `create-newsletter-subscription.dto.ts` — `update-*.dto.ts` extends the create DTO directly,
no `PartialType`, so still one real site), `NEWSLETTER_SUBSCRIPTION_SORT_ERROR` (single site).
Keep: `NEWSLETTER_SUBSCRIPTION_ALREADY_EXISTS_ERROR` (2 sites: race-catch in `create()` and
`ensureEmailIsAvailable` in `update()`), `NEWSLETTER_SUBSCRIPTION_NOT_FOUND_ERROR` (4 sites),
`NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE` (5 sites), `DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT`.

## `selectFields`

All three services drop the `private readonly selectFields = '-__v'` field; the three call sites
(`findAll`, `findById`, `update`) call `.select('-__v')` directly, matching `FavoritesService` since
MY-57.

## `create()` unification

Per the spec: `IndividualOrderService.create()` drops the post-create `findById`, returns `true`;
`IndividualOrderCreateDocs()` response schema changes from `IndividualOrderResponseDocs` to a bare
boolean, matching the other two modules. `contact-request`/`newsletter-subscription` need no code
change here (already return `true`).

## Commit breakdown

1. `docs: spec + plan for forms cleanup (MY-61)` — both files, one commit, before any code.
2. `refactor(contact-request): inline single-use constants and selectFields`
3. `refactor(individual-order): inline single-use constants and selectFields, unify create() response`
4. `refactor(newsletter-subscription): inline single-use constants and selectFields`
5. `docs: record the forms create()-response decision` — `ai/decisions/`.

## Verification

- `bun run lint`, `bun run build`.
- Reread each module's `*.constants.ts`/`*.swagger.ts`/DTOs/service afterward: every remaining
  constant has 2+ real call sites; every inlined string matches the original text exactly (no
  accidental rewording); Swagger descriptions/examples for everything except individual-order's
  create response are byte-identical to before.
