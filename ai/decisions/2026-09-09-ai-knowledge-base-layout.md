# Agent knowledge base lives in `ai/`

Date: 2026-09-09 · Status: accepted

## Context

Agent-facing knowledge was duplicated per tool: `.codex/skills/` held its own copies, `docs/ai/` held task artifacts, and rules lived in `docs/rules/`. The copies drifted apart.

## Decision

- One source: `ai/` — `rules/` (law), `skills/` (playbooks), `decisions/` (this folder), `superpowers/` (per-task spec + plan), `map.md`, `linear-task-template.md`.
- Format is tool-agnostic Markdown, readable by any agent (Claude, Codex, others).
- `AGENTS.md` is the canonical entrypoint; `CLAUDE.md` and any other tool-specific entrypoint only **point at it**.
- No per-tool mirrors of the skills — `.codex/skills/` was deleted.

Commits: `0f1af9e` (move the base under `ai/`), `650ffc1` (skill renames, workflow, DoD).

## Consequences

- Skill names carry no redundant prefixes (`module`, not `swoosh-backend-module`) — the repo is already Swoosh and already backend.
- Reshaping a pattern means updating the matching file under `ai/` in the same change (enforced in `ai/rules/definition-of-done.md`).
- Creating a tool-specific copy of this knowledge is not allowed; add it to `ai/` and link instead.
