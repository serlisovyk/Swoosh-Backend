# tsc-alias as a mandatory build step

Date: 2026-09-12 · Status: accepted

## Context

Discovered while adding the Docker image (MY-70): the prod entrypoint
(`node dist/main.js`, same as `start:prod`) crashed with
`Cannot find module '@common/errors'` inside a clean container, even though
`bun run build` followed by `node dist/main.js` worked fine on the author's
own machine.

Root cause: `@nestjs/cli`'s plain-`tsc` builder has a built-in transformer
that rewrites `@common/*`/`@modules/*`/`@shared/*` path aliases to relative
imports in the emitted JS. It is best-effort and silently swallows failures
(catches and returns the original node unchanged) — it happened to succeed
on the host and happened to no-op inside the Linux container, with no error
either way. Nobody had run the compiled output outside dev mode
(`nest start --watch`, which resolves aliases through webpack/ts-node) before
this task, so the gap was invisible until a truly clean environment exercised
it.

Also found in the same investigation: `.dockerignore` must exclude
`*.tsbuildinfo` — a copied incremental-build cache from the host (referencing
host-only absolute paths) produced a corrupt partial `dist/` inside the image
(missing `main.js` entirely).

## Decision

- `tsc-alias` is a devDependency; `"build"` is
  `"nest build && tsc-alias -p tsconfig.build.json"` — a mandatory second step
  that deterministically rewrites every path alias in `dist/` to a relative
  path, independent of the environment.
- `.dockerignore` excludes `*.tsbuildinfo` alongside `dist`.

## Consequences

- `node dist/main.js` (bare Node, no aliases resolver, no `ts-node`) now works
  in any environment — required for the Docker image's `CMD` and for
  `start:prod` generally.
- Removing the `tsc-alias` step from `build` reopens exactly this bug — do
  not "simplify" it back to plain `nest build` without an equally
  deterministic alias-resolution mechanism in its place.
- No behavior change for `nest start --watch` (dev) — it never depended on
  this.
