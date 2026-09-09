---
name: swoosh-backend-module
description: Use when creating or refactoring Swoosh Server NestJS modules, DTOs, models, constants, types, utilities, services, controllers, or module-local Swagger docs.
---

# Swoosh Backend Module

## Overview

Follow the existing NestJS module style and `docs/rules/backend-architecture.md`.

## Rules

- Keep business code in `src/modules`.
- Keep infrastructure in `src/common`.
- Keep shared config/helpers in `src/shared`.
- Controllers handle routing and response handoff.
- Services handle business logic and database orchestration.
- DTOs handle validation and request shape.
- Swagger docs live in module-local `*.swagger.ts` files.
- Add `constants`, `types`, `utils`, `dto`, and `models` only when needed.
- Keep feature-local helpers local until reuse is real.

## Verification

- Run `npm run lint`.
- Run tests for changed behavior.
- Run `npm run build` after module wiring or file deletion changes.
