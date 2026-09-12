---
name: review
description: Use when reviewing Swoosh Server backend changes for regressions, contract drift, stale docs or skills, DTO/service/controller boundaries, Swagger accuracy, or missing verification.
---

# Review

## Review order

1. **Correctness / regressions** — does the change do what it claims without breaking adjacent behavior?
2. **Public API contract + Swagger drift** — request/response shapes match `*.swagger.ts`; no persistence shape leaked; removed features not re-documented.
3. **Auth behavior** — against `ai/rules/auth-and-api-contracts.md` (token secrets separated, refresh cookie handling, password-reset alignment).
4. **Module boundaries** — against `ai/rules/architecture.md`: controllers thin, services own logic, DTOs own validation, helpers not promoted to `src/shared` prematurely.
5. **Doc/skill drift** — did README, AGENTS.md, CLAUDE.md, `ai/rules/*`, `ai/skills/*`, or `ai/map.md` become stale? A change that reshapes a pattern must update the matching skill in the same change; a change to modules, cross-cutting packages, or entry files must update `ai/map.md`.
6. **Missing decision record** — did the change settle or reverse a durable decision (a standing constraint, a deliberate removal, a tradeoff over a named alternative) without a dated record in `ai/decisions/`? Flag it. Do not flag routine changes that settle nothing.
7. **Verification gaps** — was `bun run lint` / `bun run build` warranted and done? (No test suite exists — do not flag missing tests.) Since MY-51, a green run already rules out unformatted code, floating promises, unsafe arguments, `any`, implicit `any`, unchecked null access, and unchecked array/index access — don't re-flag those as manual findings if lint/build passed; focus manual review on what the compiler and linter structurally cannot see (business logic, auth behavior, contract drift, doc staleness).

## Output

- One line per finding: `path:line — severity — problem. fix.`
- Severity by real impact, most severe first. No praise, no scope creep.

## Avoid

- Treating style preference as a finding without concrete impact.
- Requiring docs updates for routine code that does not alter stable behavior.
- Requesting tests — this project has none by design.
