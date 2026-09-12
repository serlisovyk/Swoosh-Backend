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

## Addendum (author-requested, same session)

Scope extended after initial review: wrap the template in its own folder and
add a barrel, so the per-template shape is `templates/<name>/{template.tsx,
styles.ts, index.ts}` rather than flat files — sets the convention future
templates will follow.

- Move `reset-password.template.tsx` → `reset-password/template.tsx`,
  `reset-password.styles.ts` → `reset-password/styles.ts` (`git mv`).
- Add `reset-password/index.ts`: `export { ResetPasswordEmail } from
  './template'`.
- `email.service.ts` now imports from `./templates/reset-password` (the
  barrel), not the file path.
- `ai/map.md`'s `email` row updated to describe the folder-per-template
  shape and the barrel-import rule.

## Docs

`ai/map.md` updated (see addendum) — the per-template folder/barrel shape is
a new pattern, so the map's `email` row now documents it.

## Verification

- `bun run lint`
- `bun run build`
- Manual check: diff the exported style object literals against the
  original to confirm byte-for-byte parity (visual behavior unchanged).
