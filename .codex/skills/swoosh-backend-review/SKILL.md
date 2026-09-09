---
name: swoosh-backend-review
description: Use when reviewing Swoosh Server backend changes for regressions, contract drift, stale docs or skills, DTO/service/controller boundaries, Swagger accuracy, or missing verification.
---

# Swoosh Backend Review

## Review Order

- Check correctness and regressions first.
- Check public API contract and Swagger drift.
- Check auth behavior against `docs/rules/auth-and-api-contracts.md`.
- Check module boundaries against `docs/rules/backend-architecture.md`.
- Check whether README, AGENTS, rules, or skills became stale.
- Note verification gaps clearly.

## Avoid

- Treating style preference as a finding without concrete impact.
- Requiring docs updates for routine code that does not alter stable behavior.
