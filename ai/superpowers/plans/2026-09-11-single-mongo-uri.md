# Plan: single MONGO_URI and mongoose connection options

Issue: MY-45 · Spec: `ai/superpowers/specs/2026-09-11-single-mongo-uri.md`

## Commit breakdown

1. **docs(ai): spec + plan for single MONGO_URI** — this commit, spec + plan only, no code.
2. **feat(mongo): switch to single MONGO_URI and set autoIndex/retryAttempts**
   - Delete `src/common/mongo/mongo.utils.ts`.
   - Rewrite `src/common/mongo/mongo.config.ts`: read `MONGO_URI` directly, add `autoIndex: isDev(configService)` and `retryAttempts: 3`.
   - Replace six `MONGO_*` keys with one `MONGO_URI` in `.env.sample`.
   - Replace six `MONGO_*` keys with one `MONGO_URI` in the local `.env` (build the value from the current parts so the worktree keeps working against the same cluster).
3. **docs: update map, architecture rule, README, decision record**
   - `ai/map.md` — the `mongo` row already says "the single connection"; no `mongo.utils.ts` reference to remove there (checked — not listed). Confirm no stale mention slips in.
   - `ai/rules/architecture.md` — Persistence section: note the single `MONGO_URI` var and the explicit `autoIndex`/`retryAttempts` options.
   - `README.md` — add a short "Environment" note under Setup: `MONGO_URI` comes as-is from Atlas (or any Mongo host), no manual assembly.
   - `ai/decisions/2026-09-11-single-mongo-uri.md` — new record: single URI over six-part assembly, and the `autoIndex: false` prod consequence.
   - `ai/skills/mongoose-models.md` — checked, makes no claim about automatic index creation; no edit needed.

## Verification

- `npm run lint`
- `npm run build` (required — file deleted)
- Manual start (`npm run start:dev`) against the real `MONGO_URI`, confirm the app boots and an existing endpoint responds.

## Explicitly out of scope

- Index management process, migrations, read/write replicas, env schema validation (per issue).
