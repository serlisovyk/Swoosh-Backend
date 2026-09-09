---
name: swoosh-backend-review
description: Use when reviewing Swoosh Server backend changes for regressions, contract drift, stale docs or skills, DTO/service/controller boundaries, Swagger accuracy, or missing verification.
---

# Swoosh Backend Review

## Review order

1. **Correctness / regressions** — does the change do what it claims without breaking adjacent behavior?
2. **Public API contract + Swagger drift** — request/response shapes match `*.swagger.ts`; no persistence shape leaked; removed features not re-documented.
3. **Auth behavior** — against `ai/rules/auth-and-api-contracts.md` (token secrets separated, refresh cookie handling, password-reset alignment).
4. **Module boundaries** — against `ai/rules/backend-architecture.md`: controllers thin, services own logic, DTOs own validation, helpers not promoted to `src/shared` prematurely.
5. **Doc/skill drift** — did README, AGENTS.md, CLAUDE.md, `ai/rules/*`, or `ai/skills/*` become stale? A change that reshapes a pattern must update the matching skill in the same change.
6. **Verification gaps** — was `npm run lint` / `npm run build` warranted and done? (No test suite exists — do not flag missing tests.)

## Output

- One line per finding: `path:line — severity — problem. fix.`
- Severity by real impact, most severe first. No praise, no scope creep.

## Avoid

- Treating style preference as a finding without concrete impact.
- Requiring docs updates for routine code that does not alter stable behavior.
- Requesting tests — this project has none by design.
