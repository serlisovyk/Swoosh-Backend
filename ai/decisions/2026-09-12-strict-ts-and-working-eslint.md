# Strict TS mode + a working ESLint gate

Date: 2026-09-12 · Status: accepted

## Context

`ai/rules/definition-of-done.md` names `lint` + `build` as the entire
verification gate (no test suite, see
[decisions/no-test-suite](2026-09-09-no-test-suite.md)). Both were
configured to pass on exactly the defects the code conventions forbid:
`prettier/prettier` was wired in and then set to `'off'`,
`no-floating-promises` and `no-unsafe-argument` were `'warn'` (never fail
the build), `no-explicit-any` was `'off'` alongside `noImplicitAny: false`,
and `tsconfig.json` never turned on `strict`.

## Decision

- `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`,
  `noFallthroughCasesInSwitch: true`, `declaration: false`.
- `strictPropertyInitialization: false` — kept off **on purpose**. Mongoose
  schema classes declare fields like `@Prop() name: string` with no
  initializer; the field is populated by the schema/decorator, not the
  constructor. Turning this on would force every model field to `!` or a
  fake default, which is worse than the one targeted exception.
- `eslint.config.mjs` no longer overrides `no-explicit-any`,
  `no-floating-promises`, `no-unsafe-argument`, or `prettier/prettier` at
  all — checked each against the base configs (`tseslint.configs.recommendedTypeChecked`,
  `eslint-plugin-prettier`'s `recommended`) and all four are already
  `'error'` there. The old config didn't set them to `'error'`; it
  explicitly downgraded them to `'off'`/`'warn'`, fighting its own base
  config. Deleting those overrides restores the base severity — no
  redundant restatement to drift out of sync later, and no intermediate
  `'warn'` step for `no-explicit-any` was needed either: a repo-wide grep
  found zero `any` usage in `src/`.
- `eslint-plugin-prettier` stays a devDependency and its `recommended`
  config (which sets `prettier/prettier: 'error'`) stays wired in. The
  alternative the issue raised — drop the plugin and let `bun run format`
  be the only format check — was rejected: a "gate" that only runs when
  someone remembers to invoke it separately isn't a gate.
- `.prettierrc` gets `"endOfLine": "auto"`. Turning on `prettier/prettier:
  'error'` surfaced ~7200 lint errors, of which 7185 were CRLF line endings
  — an artifact of this machine's `core.autocrlf=true` git setting, not a
  real defect (the blobs in git are LF). The alternative — add
  `.gitattributes` with `eol=lf` and renormalize every file in the repo to
  LF — was rejected for this ticket: it would touch nearly every file for a
  reason unrelated to their content, on a branch where a parallel task
  (MY-41) already touches overlapping files. `endOfLine: "auto"` makes
  Prettier accept whichever line ending a file already has instead of
  forcing one, which is enough to make the real 43 formatting violations
  (fixed via `bun run format`) visible without that unrelated churn.
- `tseslint.config(...)` → `defineConfig([...])` from `eslint/config`
  (`ignores` → `globalIgnores(...)`) — the deprecation warning's own
  suggested fix, not a new decision, just executed.

## Consequences

- `bun run lint` now fails on unformatted code and on a floating promise —
  verified directly: temporarily added an unawaited async call with broken
  indentation, confirmed both `prettier/prettier` and `no-floating-promises`
  failed the run, then reverted before committing.
- No `any`/`as` was added anywhere to make this pass — the only source fix
  was `token[0] ?? ''` in `turnstile.utils.ts` (a real `noUncheckedIndexedAccess`
  catch, the same defect MY-42's review already flagged).
- A future `any` that's genuinely unavoidable needs a local
  `eslint-disable-next-line` with a reason, not a global rule downgrade —
  see `ai/rules/code-conventions.md`.
- Repo line endings are not normalized to LF. A Windows checkout with
  `core.autocrlf=true` will keep seeing CRLF locally and that's fine —
  Prettier no longer treats it as a violation. This does mean the working
  tree isn't byte-for-byte identical across checkouts on different
  platforms; if that ever becomes a real problem, normalizing via
  `.gitattributes` is the fix, and it's a new decision, not a silent revert
  of this one.
