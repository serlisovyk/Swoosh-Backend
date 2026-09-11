# Plan: MY-41 — remove dead jest scaffolding

No spec — this doesn't change observable behavior or a public/data
contract, it removes tooling that already does nothing (or is broken).

## Confirmed course of action

Staying without tests, per `ai/decisions/2026-09-09-no-test-suite.md` (still
accepted, not reversed). This task brings the repo in line with that
decision — it does not revisit it. If tests were ever wanted back, that
would be a new decision and a new record, not this change.

## Commit 1 — package.json: drop test scripts and test-only devDependencies

Files: `package.json`, `bun.lock`.

- Remove scripts: `test`, `test:watch`, `test:cov`, `test:debug`,
  `test:e2e`.
- Remove devDependencies: `jest`, `ts-jest`, `@types/jest`, `supertest`,
  `@types/supertest`, `@nestjs/testing`.
- Run `bun install` after editing `package.json` so `bun.lock` reflects the
  removal — commit both together.
- Leave every other script and dependency untouched.

## Commit 2 — narrow lint/format globs, drop test excludes and jest globals

Files: `package.json`, `tsconfig.json`, `tsconfig.eslint.json`,
`eslint.config.mjs`.

- `package.json`: `lint`/`lint:fix` glob `{src,apps,libs,test}/**/*.ts` →
  `src/**/*.ts` (`apps`, `libs`, `test` don't exist). `format` glob drops
  the `"test/**/*.ts"` argument, keeping only `"src/**/*.ts"`.
- `tsconfig.json`: `exclude` list `["node_modules", "dist", "test",
"**/*.spec.ts", "jest.config.ts"]` → `["node_modules", "dist"]` — the
  other three paths don't exist.
- `tsconfig.eslint.json`: `include` list drops `"jest.config.ts"` (removed
  in commit 3) — keeps `"src/**/*.ts"`, `"src/**/*.tsx"`.
- `eslint.config.mjs`: `languageOptions.globals` drops `...globals.jest` —
  keeps `...globals.node`.

## Commit 3 — delete jest.config.ts

Files: `jest.config.ts` (removed).

- Nothing else references it after commit 2.

## Commit 4 — docs

- `ai/decisions/2026-09-09-no-test-suite.md`: append to Consequences —
  the leftover jest scripts/deps/config called out in that record's
  original text are now removed; the decision itself is unchanged.
- `README.md`: Checks section already only lists `bun run lint`/`bun run
build` and states "no automated test suite" — confirm nothing there
  references the removed scripts (grep before editing; likely no change
  needed).
- `ai/rules/definition-of-done.md` / `ai/workflow.md`: only touch if a
  verification sentence turns out to reference the removed commands —
  expected to need no change (they already just say "lint + build").

## Verification

- `bun run lint`
- `bun run build` (required — dependencies and files are being removed)
- Confirm no remaining reference to `jest`, `supertest`, `ts-jest`,
  `@nestjs/testing`, or the deleted `test/`/`jest.config.ts` paths anywhere
  in `package.json`, `tsconfig*.json`, or `eslint.config.mjs`.
