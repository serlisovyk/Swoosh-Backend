# Decisions

Durable backend decisions. One decision per file, named `YYYY-MM-DD-<slug>.md`.

How this differs from `ai/rules/`: **rules** state what to do now (current law, rewritten as it changes). **Decisions** state *why* a choice was made, with a date — they are appended, never rewritten. If a decision is reversed, add a new record and mark the old one `Status: superseded by <file>`; do not delete it.

Format: `Context` → `Decision` → `Consequences`. Short and specific.

The point: an agent (or a human) does not relitigate settled questions or "helpfully" restore something that was deliberately removed.

## When to add a record

Propose one **as soon as the decision surfaces** — in conversation or in a change — without being asked:

- a standing constraint ("we will not do X", "always / never Y");
- a deliberate removal that must not be restored;
- a tradeoff accepted over a named alternative;
- a target agreed now, implemented later (`Status: accepted (not implemented)`);
- a convention chosen where an obvious alternative existed.

Not decisions: one-off task details, plain current-state facts, or anything `ai/rules/` and `ai/map.md` already cover. Do not create noise records.

## Records

- [2026-09-09 — stateless refresh tokens](2026-09-09-stateless-refresh-tokens.md)
- [2026-09-09 — email verification and OAuth removed](2026-09-09-remove-email-verification.md)
- [2026-09-09 — no test suite by design](2026-09-09-no-test-suite.md)
- [2026-09-09 — canonical error envelope as the target](2026-09-09-error-envelope-target.md)
- [2026-09-09 — agent knowledge base lives in `ai/`](2026-09-09-ai-knowledge-base-layout.md)
- [2026-09-11 — single MONGO_URI over six-part assembly](2026-09-11-single-mongo-uri.md)
- [2026-09-11 — refresh-cookie cross-site `sameSite`/`secure` policy](2026-09-11-refresh-cookie-cross-site-policy.md)
- [2026-09-11 — Swagger docs gated with basic auth, not disabled, outside dev](2026-09-11-swagger-access-in-prod.md)
- [2026-09-12 — tsc-alias as a mandatory build step](2026-09-12-tsc-alias-for-prod-build.md)
- [2026-09-12 — local pre-commit hook instead of CI](2026-09-12-precommit-hook-instead-of-ci.md)
- [2026-09-12 — public form `create()` always returns a bare boolean](2026-09-12-forms-create-response-is-boolean.md)
