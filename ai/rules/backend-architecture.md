# Backend Architecture Rules

## Scope

These rules apply to the Swoosh Server backend.

## Architecture

- Use NestJS with module-based structure.
- Keep business code in `src/modules`.
- Keep shared infrastructure in `src/common`.
- Keep shared config, constants, and helpers in `src/shared`.
- Reuse existing helpers before creating parallel abstractions.

## Module Structure

- Follow nearby modules before inventing a new layout.
- Keep `module`, `controller`, and `service` files as baseline module entrypoints.
- Add `dto`, `models`, `types`, `constants`, `utils`, and `swagger` files only when the module needs them.
- Keep module-local helpers, constants, and types next to the module until reuse is clear.
- Do not move feature-specific helpers into `src/shared` too early.

## Responsibility Boundaries

- Controllers handle routes, decorators, request extraction, and response handoff.
- Services contain business logic and database orchestration.
- DTOs define request shape and validation.
- Swagger docs live in module-local `*.swagger.ts` files.
- Keep public API contracts explicit.
- Do not leak persistence shape into public responses.

## Query Endpoint Pattern

- Prefer DTO-based parsing and validation over ad hoc request checks.
- Normalize query input in DTOs or dedicated query helpers, not inside services.
- Keep module-specific filtering rules in the module.
- When a list endpoint follows a query-options builder pattern, keep using it.
- Keep default sort and limit values in module constants when reused.
