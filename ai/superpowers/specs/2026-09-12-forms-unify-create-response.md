# Spec: unify the three form modules' `create()` response (MY-61)

## Why a spec

`POST /forms/individual-orders` changes its response body from the full created record
(`IndividualOrderResponseDocs`, including `_id`) to a bare `boolean` (`true`). This is a public
contract change, not internal tidying, so it needs to be written down deliberately.

## Context

Three form modules (`contact-request`, `individual-order`, `newsletter-subscription`) each expose a
public, unauthenticated `POST` endpoint for submitting a form. Today they diverge on what a
successful submission returns:

- `ContactRequestService.create()` — creates the document, returns `true`.
- `IndividualOrderService.create()` — creates the document, then does a **second** `findById` query
  and returns the full record.
- `NewsletterSubscriptionService.create()` — `exists()` check, returns `true` on a pre-existing
  email without writing; otherwise `create()`, with a `code 11000` catch as a race-safety net,
  returns `true`.

Swagger for all three already documents exactly what happens today (verified — no doc/runtime
drift), so this isn't a bug fix, just three modules that settled on different answers to the same
question.

## Decision: all three return `true`, `individual-order` drops the extra query

**Chosen: `IndividualOrderService.create()` stops calling `findById` after `create()` and returns
`true`, matching `contact-request` and `newsletter-subscription`.**

Rationale (author-approved after being asked, given the described risk):

- The client submitting a public form has no use for the created record's `_id` — nothing in this
  repo's form flows reads it back.
- The extra `findById` is a second database round-trip on every submission to a public,
  unauthenticated, low-trust endpoint — exactly the kind of request path where an avoidable query is
  worth removing.
- The alternative (documenting the divergence as intentional in `ai/skills/module.md`) was
  considered and rejected: keeping three different answers to "what does creating a form
  submission return" is a worse default for the next form module than a single one.

This **is** a breaking change for any client reading `_id` off `POST /forms/individual-orders`'
response — flagged explicitly to, and accepted by, the repo author, since the backend-only scope of
this task means the frontend could not be checked from here.

## Changes

- `IndividualOrderService.create()`: create the document, return `true`. No more post-create
  `findById`.
- `IndividualOrderSwagger.IndividualOrderCreateDocs()`: `ApiCreatedResponse` changes from
  `{ type: IndividualOrderResponseDocs }` to `{ schema: { type: 'boolean', example: true } }` —
  the same shape `ContactRequestCreateDocs`/`NewsletterSubscriptionCreateDocs` already use.
- `IndividualOrderController.create()` is unaffected (no explicit return type annotation; it already
  just forwards the service's return value).
- `contact-request` and `newsletter-subscription` `create()` are unaffected — they already return
  `true`.

## Explicitly not in this change

- `newsletter-subscription`'s duplicate-email race handling (`exists()` check + `code 11000` catch)
  — a correctness guarantee unrelated to the response shape, left untouched.
- `findById`/`findAll`/`update`/`remove` on any of the three modules — unaffected.
- Any other divergence between the three modules' CRUD skeletons — out of scope per MY-60's
  explicit "not doing this" decision (three services keep their own `findAll`/`findById`/`update`/
  `remove`).
