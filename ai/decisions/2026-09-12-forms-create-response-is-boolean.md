# Public form `create()` always returns a bare boolean

Date: 2026-09-12 · Status: implemented (MY-61)

## Context

The three public form-submission endpoints (`contact-request`, `individual-order`,
`newsletter-subscription`) had settled on three different `create()` responses: `contact-request`
and `newsletter-subscription` returned `true`; `individual-order` did a second `findById` after
`create()` and returned the full record (with `_id`). Swagger for all three already documented
exactly what happened — not a bug, just an accidental divergence between modules built at different
times for the same kind of operation ("a visitor submits a public form").

## Decision

Every form module's `create()` returns `true` on success, nothing else. `individual-order` drops its
extra post-create `findById` to match. This was raised as an explicit choice with the repo author
(the alternative — keep `individual-order` returning the full record, document the divergence as
intentional in `ai/skills/module.md` — was on the table) because changing `individual-order`'s
response is a breaking change for any client reading `_id` back from that endpoint, and this repo's
scope is backend-only, so the frontend could not be checked from here. The author chose to unify.

Rationale: nothing in this repo's form flows needs the created record back — these are
fire-and-forget public submissions, not resources a client immediately re-fetches or edits by id.
The extra `findById` was a second database round-trip on every submission to a public, unauthenticated
endpoint, worth avoiding once nothing depends on its result.

## Consequences

- A future form module's `create()` should return `true`, not the created record — this is now the
  established shape for "public form submission succeeded," not a per-module choice to relitigate.
- `newsletter-subscription`'s duplicate-email race handling (`exists()` pre-check + `code 11000`
  catch) is a correctness guarantee, not a response-shape decision — unaffected by this record.
- If a future requirement needs the client to have the created record's id (e.g. a "track your
  submission" flow), that is a new, deliberate contract change with its own spec — not a reason to
  quietly special-case one module again.
