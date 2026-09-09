---
name: module
description: Use when creating or refactoring Swoosh Server NestJS modules, DTOs, models, constants, types, utilities, services, controllers, or module-local Swagger docs.
---

# Feature Module

## When to use

Creating a new feature module, adding an endpoint, splitting a fat file, or aligning a module with house style. Read `ai/rules/architecture.md` and `ai/rules/code-conventions.md` first.

## Where code lives

See `ai/map.md` for the current module list, cross-cutting packages, and entry files — it is the single place that inventory is maintained. In short: features in `src/modules/*`, shared infrastructure in `src/common/*` (each with an `index.ts` barrel), cross-cutting config/constants/utils in `src/shared/*`.

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

Sub-features nest as their own folder with the same anatomy: see `src/modules/auth/auth-account/` and `src/modules/forms/*`.

## Responsibility boundaries

- Controllers: routes, decorators, request extraction, response handoff. No business logic.
- Services: business logic + Mongoose orchestration.
- DTOs: request shape + validation only.
- Swagger: module-local `*.swagger.ts`, never leak persistence shape into public responses.

## Rules

- Follow a nearby module before inventing a new layout.
- Keep feature-local helpers/constants/types next to the module until reuse is real; do not promote to `src/shared` early.
- Reuse existing helpers (`src/shared/utils`, module barrels) before adding parallel ones.
- Do not create placeholder files just to mirror another module.
- Remove stale constants/types after deleting a feature.

## Verification

- `npm run lint`.
- `npm run build` after module wiring, contract, or file-deletion changes.
- No test suite exists; do not add tests unless explicitly asked.
