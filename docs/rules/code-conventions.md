# Code Conventions

## TypeScript

- Prefer readable, explicit TypeScript over clever abstractions.
- Keep controller, service, DTO, model, Swagger, and utility responsibilities separate.
- Use path aliases already configured by the project.
- Avoid broad `any`; when unavoidable, keep it local and obvious.

## Constants

- Do not extract every text string into constants by default.
- Keep constants for repeated values, domain values, configuration names, cookie names, throttling configs, shared examples, and values used across files.
- Inline one-off validation messages, Swagger descriptions, and examples when they are only used locally and extraction hurts readability.
- Remove stale constants after deleting features.

## Files

- Keep feature-local helpers inside the feature module until reuse is real.
- Do not create placeholder files just to mirror another module.
- Keep generated output such as `dist` and `node_modules` out of edits.
