# No test suite by design

Date: 2026-09-09 · Status: accepted

## Context

The test files were maintained unevenly and drifted behind the code. At the project's current pace they produced false confidence rather than protection.

## Decision

The repository has no automated tests. Changes are verified with `npm run lint` + `npm run build` plus manual reasoning against `ai/rules/`.

## Consequences

- Do not add tests unless explicitly asked. Review must not require tests and must not report their absence as a finding.
- `package.json` still carries jest scripts (`test`, `test:watch`, `test:cov`, `test:e2e`) and devDependencies (`jest`, `ts-jest`, `supertest`), but no spec files exist — so `npm test` runs nothing meaningful. This leftover is known, not a forgotten setup.
- Bringing tests back is a new decision and a new record here.
