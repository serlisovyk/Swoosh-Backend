# No test suite by design

Date: 2026-09-09 · Status: accepted

## Context

The test files were maintained unevenly and drifted behind the code. At the project's current pace they produced false confidence rather than protection.

## Decision

The repository has no automated tests. Changes are verified with `npm run lint` + `npm run build` plus manual reasoning against `ai/rules/`.

## Consequences

- Do not add tests unless explicitly asked. Review must not require tests and must not report their absence as a finding.
- The leftover jest scaffolding this record originally called out (`test`, `test:watch`, `test:cov`, `test:debug`, `test:e2e` scripts; `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`, `@nestjs/testing` devDependencies; `jest.config.ts`; the dead `test`/`apps`/`libs` path references in `tsconfig*.json` and the lint/format globs; `globals.jest` in `eslint.config.mjs`) has been removed — see MY-41. The repo no longer carries tooling for a suite that doesn't exist.
- Bringing tests back is a new decision and a new record here — it would also mean re-adding this scaffolding, not just spec files.
