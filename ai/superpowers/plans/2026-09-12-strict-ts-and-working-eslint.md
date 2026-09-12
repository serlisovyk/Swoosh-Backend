# Plan: fix the quality gate — TS strict mode + a working ESLint config

Issue: MY-51 · Branch: `my-51-strict-ts-eslint`

No spec: this doesn't change any public/data contract or observable app
behavior — it only changes what `bun run lint` / `bun run build` catch.
Prototyped the fix first (see below) to find out whether it fits in one
commit or needs staging; it does, so no spec is needed per the issue's own
criterion ("spec needed only if we stage it").

## Prototyping result (why this is a single-shot fix, not staged)

Tried `strict: true` + `noUncheckedIndexedAccess: true` first: exactly **one**
compile error surfaced — `src/common/captcha/turnstile.utils.ts`'s
`token[0]` (the same defect MY-42 already flagged from code review; strict
mode now catches it at compile time). Fixed with `token[0] ?? ''`, no
`any`/`as`.

Then rewrote `eslint.config.mjs` to the target rule set: lint produced ~7200
"problems", but 7185 of them were `` Delete `␍` `` — CRLF line endings from
this machine's `core.autocrlf=true`, not real formatting violations (the
files as stored in git are LF; this is a local checkout artifact). Setting
`endOfLine: "auto"` in `.prettierrc` (accept whatever line ending a file
already has, don't force one) made that noise disappear, leaving **43** real
formatting violations, all fixed by `bun run format`. Full detail and the
alternative considered (normalizing every file in the repo to LF via
`.gitattributes`) is in the decision record.

Net diff: ~23 files, config + one 1-line logic fix + prettier's own
reformatting. Small enough for one PR.

## Commit breakdown

1. **docs(ai): plan for MY-51** — this file, committed alone before any code.
2. **fix(tsconfig): enable TS strict mode** — `tsconfig.json`: `strict: true`,
   `strictPropertyInitialization: false` (mongoose classes declare
   `@Prop() name: string` with no initializer — this is required, not
   optional), `noUncheckedIndexedAccess: true`, `noFallthroughCasesInSwitch:
   true`, `declaration: false`. Removes the now-redundant `strictNullChecks`
   / `noImplicitAny: false` / `strictBindCallApply: false` (superseded by
   `strict: true`, not left alongside it). Plus the one real fix this
   surfaced: `turnstile.utils.ts`'s `token[0] ?? ''`.
3. **fix(eslint): replace deprecated tseslint.config, raise warn rules to
   error** — `eslint.config.mjs`: `tseslint.config(...)` → `defineConfig([...])`
   from `eslint/config` (the deprecation warning's own suggested fix,
   confirmed available in the installed `eslint@9.39`), `ignores` →
   `globalIgnores(...)`. Rule changes: `no-floating-promises` and
   `no-unsafe-argument` `warn` → `error`; `no-explicit-any` `off` → `error`
   directly (not `warn` — there is zero `any` in `src/`, confirmed by grep,
   so there's no need for an intermediate step); `prettier/prettier` `off` →
   `error`; `no-unused-vars` gets `varsIgnorePattern: '^_'` alongside the
   existing `argsIgnorePattern`. `.prettierrc` gets `endOfLine: "auto"` (see
   decision record). Then `bun run format` to fix the 43 real violations
   this surfaced.
4. **docs: record MY-51 decisions, update rules/skills/README** —
   `ai/decisions/` (strict mode + `strictPropertyInitialization` exception +
   `eslint-plugin-prettier` kept + `endOfLine: auto`),
   `ai/rules/code-conventions.md` (TypeScript/Formatting/Async: what the gate
   now actually enforces), `ai/rules/definition-of-done.md` (what
   `bun run lint`/`bun run build` cover now), `ai/skills/review.md` (some
   manual checks are now compiler/lint-enforced), `README.md` (Checks
   section).

## Verification

- `bun run lint`, `bun run build` — both clean.
- Negative check (done manually, not committed): temporarily added an
  unawaited async call with bad indentation to `system.service.ts`, confirmed
  `bun run lint` fails on both `no-floating-promises` and `prettier/prettier`,
  then reverted.
- No `any`/`as` introduced anywhere to silence an error (per the issue's
  hard constraint) — the only source fix is the narrowing `?? ''` in
  `turnstile.utils.ts`.

## Out of scope

- `test/**/*.ts` glob in `lint`/`format` scripts, `jest.config.ts`, jest
  devDependencies, `globals.jest` in `eslint.config.mjs` — MY-41's scope
  (dead jest teardown), not touched here even though this task rewrites the
  same file, to avoid doing MY-41's job for it.
- New lint rules beyond what the issue lists (`import/order`,
  naming-convention, etc.) — separate conversation, per the issue.
- CI, pre-commit hooks, lint-staged, adding tests.
- Normalizing repo-wide line endings to LF via `.gitattributes` — considered,
  rejected in favor of `endOfLine: "auto"` (see decision record): it would
  touch nearly every file in the repo for a non-content reason, on a branch
  where a parallel task (MY-41) is already touching overlapping files.
