---
name: swoosh-query-filters
description: Use when changing Swoosh Server list endpoints, search, pagination, sorting, query DTO transforms, or Mongo query filter builders.
---

# Swoosh Query Filters

## Rules

- Parse and validate query input in DTOs or dedicated query helpers.
- Keep module-specific filter rules inside the module.
- Use existing query utilities before adding new helpers.
- Keep pagination and sort defaults in constants when reused.
- Avoid service-level ad hoc parsing of raw query strings.

## Verification

- Add or update tests for changed query behavior when practical.
- Run `npm run lint`.
- Run `npm run build`.
