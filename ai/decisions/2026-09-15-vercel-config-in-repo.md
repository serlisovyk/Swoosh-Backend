# Vercel deploy config moves from the dashboard into `vercel.json`

**Status:** accepted

## Context

[decisions/vercel-serverless-entry](2026-09-12-vercel-serverless-entry.md) set
up the serverless entry point but left the build command, framework preset,
and output directory as Vercel **project dashboard settings** — nothing
committed. That worked, but the deploy could not be reproduced or reviewed
from the repo alone: a fresh Vercel project pointed at this repo would build
wrong until someone manually replicated dashboard settings that exist nowhere
in version control.

`public/.gitkeep` was also committed to satisfy the "Other" preset's static
output directory requirement — an empty tracked directory whose only purpose
is a placeholder, need to remember not to put real files in it, and no build
step actually depends on the directory being tracked.

## Decision

- `vercel.json` now sets `framework: null`, `buildCommand: "bun run
  build:vercel"`, and `outputDirectory: "public"` alongside the existing
  `rewrites` rule. The Vercel dashboard no longer carries any build
  configuration for this project — everything deploy-relevant is in the repo.
- `bun run build:vercel` (`bun run build && mkdir -p public`) is a new script,
  kept separate from `bun run build` — Docker and local dev only need the
  compiled `dist/`, not an empty `public/`. Vercel is the only caller of
  `build:vercel`.
- `public/` is now gitignored and created by the build script instead of
  being a tracked placeholder directory (`public/.gitkeep` removed). Nothing
  is ever meant to be served as static output from this project — the
  directory only exists to satisfy Vercel's preset check.
- `outputDirectory` is set to `public`, never `.` (repo root) — the root
  would make Vercel serve the whole working tree as static files, and static
  matches are resolved before `rewrites`, so `src/`, `dist/`, `ai/` would
  become reachable over HTTP ahead of the API function.

## Consequences

- A new Vercel project pointed at this repo builds correctly with zero manual
  dashboard configuration — `vercel.json` is the single source of truth.
- `public/` no longer exists in a fresh checkout until a build runs; this is
  expected and is why `build:vercel`, not `build`, creates it.
- Lint/build cannot verify deploy-config correctness — this class of change
  is only confirmed by an actual Vercel deploy.
