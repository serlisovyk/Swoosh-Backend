# Plan: MY-77 — split reset-password styles from markup

## Why

`reset-password.template.tsx` mixes JSX markup (~40 lines) with 9 inline-style
objects (~55 lines) in one file. No public/data contract changes — pure
internal refactor, so no spec is needed.

## Change

1. New `src/common/email/templates/reset-password.styles.ts`: move the 9
   style objects (`body`, `container`, `heading`, `text`, `textSmall`,
   `buttonContainer`, `button`, `link`, `footer`) out verbatim, each exported.
2. `reset-password.template.tsx`: import the styles from
   `./reset-password.styles`, keep using them as `style={...}` — file now
   holds only JSX markup and imports.

## Commit breakdown

1. `refactor(email): split reset-password styles into own file` — the two
   file changes above, single commit (no separate plan-only commit since
   there's no spec and the change is this small — plan still written and
   committed first, before the code, per workflow).

## Docs

No `ai/map.md`/skill update needed: the `email` package's map entry already
says templates live under `templates/*.template.tsx` and doesn't enumerate
per-template internals; no new pattern is introduced (no other template
exists yet to reflect a shared convention on).

## Verification

- `bun run lint`
- `bun run build`
- Manual check: diff the exported style object literals against the
  original to confirm byte-for-byte parity (visual behavior unchanged).
