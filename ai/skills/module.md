---
name: module
description: Use when creating or refactoring Swoosh Server NestJS modules, DTOs, models, constants, types, utilities, services, controllers, or module-local Swagger docs.
---

# Feature Module

## When to use

Creating a new feature module, adding an endpoint, splitting a fat file, or aligning a module with house style. Read `ai/rules/architecture.md` and `ai/rules/code-conventions.md` first.

## Where code lives

See `ai/map.md` for the current module list, cross-cutting packages, and entry files — it is the single place that inventory is maintained. In short: features in `src/modules/*`, shared infrastructure in `src/common/*` (each with an `index.ts` barrel), cross-cutting config/constants/utils in `src/shared/*`. A feature module gets its own `index.ts` barrel too, once another module needs to import from it (see `src/modules/auth/index.ts`) — don't add one speculatively before that's true.

Adding, removing, or renaming a module means updating `ai/map.md` in the same change.

## Module anatomy

Baseline files, always: `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts`.

Add only when the module needs them (copy the shape from an existing module such as `src/modules/products`):

- `dto/` — one file per request shape. List endpoints get `find-all-<feature>.dto.ts`; mutations get `create-*` / `update-*`. Validation via `class-validator`, transform via `class-transformer`.
- `models/` — Mongoose schema/model, one file per collection (`<name>.model.ts`).
- `<feature>.swagger.ts` — module-local Swagger wrappers (see `swagger-docs`).
- `<feature>.constants.ts` — repeated/domain values, sort and pagination defaults, cookie names, example values.
- `<feature>.types.ts` — module-local types.
- `<feature>.utils.ts` — module-local helpers, e.g. Mongo filter builders (see `query-filters`).

Sub-features nest as their own folder with the same anatomy: see `src/modules/auth/password-reset/` and `src/modules/forms/*`.

## Responsibility boundaries

- Controllers: routes, decorators, request extraction, response handoff. No business logic.
- Services: business logic + Mongoose orchestration.
- DTOs: request shape + validation only.
- Swagger: module-local `*.swagger.ts`, never leak persistence shape into public responses.

## Rules

- Follow a nearby module before inventing a new layout.
- Keep feature-local helpers/constants/types next to the module until reuse is real; do not promote to `src/shared` early.
- Reuse existing helpers (`src/shared/utils`, module barrels) before adding parallel ones.
- No bidirectional dependency between two feature modules (see `ai/rules/architecture.md`). If you find module B importing from module A while A already imports from B, that's the bug to fix, not a pattern to extend.
- Do not create placeholder files just to mirror another module.
- Remove stale constants/types after deleting a feature.

## Verification

- `npm run lint`.
- `npm run build` after module wiring, contract, or file-deletion changes.
- No test suite exists; do not add tests unless explicitly asked.
