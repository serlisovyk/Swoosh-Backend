# Plan: system module (`GET /api/v1`, `GET /api/v1/health`)

Issue: MY-48 · Branch: `my-48-system-health-module`

## Commit breakdown

1. **docs(ai): spec + plan for MY-48** — this file + the spec, one commit, before code.
2. **feat(system): add system module with root and health endpoints** — new `src/modules/system/` (`system.module.ts`, `system.controller.ts`, `system.service.ts`, `system.types.ts`, `system.swagger.ts`), registered in `app.module.ts`.
3. **docs(ai): document system module for MY-48** — `ai/map.md` (new module row), `ai/rules/auth-and-api-contracts.md` (public-endpoint list gets these two), `README.md` (mention the health URL).

## Implementation details

### `system.types.ts`

```ts
export interface SystemHelloResponse {
  message: string
}

export interface SystemHealthResponse {
  status: 'ok'
  timestamp: string
}
```

### `system.service.ts`

- `hello(): SystemHelloResponse` → `{ message: \`${this.configService.getOrThrow<string>('APP_NAME')} API\` }`.
- `health(): SystemHealthResponse` → `{ status: 'ok', timestamp: new Date().toISOString() }`.
- Injects `ConfigService` — no Mongoose model, no other module dependency.

### `system.controller.ts`

- `@Controller()`, no class-level path.
- `GET` (empty path) → `hello()`. `GET('health')` → `health()`.
- Both: `@SkipThrottle()`, `@HttpCode(HttpStatus.OK)`.
- No `@Auth()`, no `@Captcha()` — public by omission, same as every other unauthenticated endpoint in the repo (there is no `@Public()` marker decorator in this codebase — protection is opt-in via `@Auth()`, not opt-out).

### `system.module.ts`

- `controllers: [SystemController]`, `providers: [SystemService]`. No imports — no schema, no other module needed.
- Register in `app.module.ts`'s `imports` array.

### `system.swagger.ts`

- `SystemTagDocs` → `ApiTags('System')`.
- `SystemHelloResponseDocs` / `SystemHealthResponseDocs` classes with property docs via `createPropertyDocsDecorator`, examples in `system.constants.ts` only if reused more than once (a single literal example inline is fine here per `code-conventions.md`'s constants policy — this is a two-endpoint module, not worth a constants file).
- `SystemHelloDocs()` / `SystemHealthDocs()` — `ApiOperation({ ..., security: [] })` + `ApiOkResponse({ type: ... })`. No error responses documented: neither endpoint takes input, so there is nothing to 400/401/403/404 on.

## Verification

- `npm run lint`
- `npm run build`
- Manual: `curl` (or the Swagger UI "Try it out") against `GET /api/v1` and `GET /api/v1/health` without any `Authorization` header — both 200, and neither shows up as rate-limited after rapid repeated calls (`@SkipThrottle`).
- Confirm both appear in `/api/v1/docs` under a "System" tag with a non-empty response schema.

## Out of scope

- `@nestjs/terminus`, `/health/ready`, Mongo ping, metrics, uptime — see spec.
