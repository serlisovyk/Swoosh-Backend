# Plan: MY-53 — auth-баги

Спецификация: `ai/superpowers/specs/2026-09-11-pochinit-bagi-auth-srok-refresh-bessrochnyj-access-reset-token-kuki.md`

## Коммит 0 (этот) — spec + plan

Один коммит, до кода.

## Коммит 1 — единый источник срока refresh-токена + обязательный `expiresIn`

Файлы: `src/modules/auth/auth.service.ts`, `.env.sample`.

- `setRefreshTokenCookie` и `getRefreshTokenExpiresAt`: убрать
  `JWT_REFRESH_TOKEN_EXPIRES_DAYS` / `ONE_DAY_IN_MS`, считать expiry через
  `ms(configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN'))`.
- `generateSessionTokens`: `get` → `getOrThrow` для
  `JWT_ACCESS_TOKEN_EXPIRES_IN` и `JWT_REFRESH_TOKEN_EXPIRES_IN`.
- Один helper `getRefreshTokenExpiresInMs()` переиспользуется в подписи JWT
  и в `getRefreshTokenExpiresAt`, чтобы не читать переменную дважды с разным
  кастом.
- `.env.sample`: убрать `JWT_REFRESH_TOKEN_EXPIRES_DAYS`,
  `JWT_ACCESS_TOKEN_EXPIRES_HOURS`.

## Коммит 2 — cookie `sameSite`/`secure` под раздельные домены

Файлы: `src/modules/auth/auth.service.ts`.

- `defaultCookieOptions`: `secure: !isDev(configService)`,
  `sameSite: isDev(configService) ? 'lax' : 'none'`.

## Коммит 3 — reset-токен: только HMAC, атомарное гашение

Файлы: `src/modules/user/user.service.ts`, `src/modules/auth/auth.utils.ts`,
`src/modules/auth/auth-account/auth-account.service.ts`.

- `findByPasswordResetToken` → переименовать в `consumePasswordResetToken`
  (находит и сразу гасит через `findOneAndUpdate` с
  `resetPasswordToken: hashedToken` в фильтре и `$set: { resetPasswordToken:
null, resetPasswordTokenExpiresAt: null }`), убрать `legacyHashedToken` /
  сырой `token` из фильтра.
- `AuthAccountService.resetPassword`: вызывает
  `consumePasswordResetToken`, дальше как раньше передаёт `newPassword` в
  `resetPassword(userId, newPassword)` (который просто хэширует и пишет
  пароль — токен уже погашен предыдущим шагом, поэтому его больше не нужно
  обнулять там).
- Удалить `hashToken` из `auth.utils.ts`.

## Коммит 4 — тайминг-энумерация в login

Файлы: `src/modules/auth/auth.service.ts`, `src/modules/auth/auth.constants.ts`.

- Константный dummy-хэш (сгенерированный `argon2.hash` от фиксированной
  строки, захардкожен как константа — считается один раз при старте
  процесса, не на каждый запрос) в `auth.constants.ts`.
- `validateUser`: при отсутствии пользователя — `await
verify(DUMMY_PASSWORD_HASH, password)` перед `throw`, результат
  отбрасывается (`noop`).

## Коммит 5 — 409 на гонку при регистрации

Файлы: `src/modules/user/user.service.ts`.

- `create`: обернуть `userModel.create` в `try/catch`, при `error.code ===
11000` бросить `ConflictException(USER_ALREADY_EXISTS_ERROR)`, иначе
  пробросить дальше.

## Коммит 6 — документация

- `ai/decisions/`: новый record — `sameSite: 'none'`/`secure: true` в
  проде — следствие раздельных доменов фронта и API.
- `ai/decisions/2026-09-09-stateless-refresh-tokens.md`: дополнить
  Consequences — единственный источник срока жизни refresh-токена
  (`JWT_REFRESH_TOKEN_EXPIRES_IN`).
- `ai/rules/auth-and-api-contracts.md`: секция Password Reset — атомарное
  гашение; секция Auth Model — единая переменная срока refresh.
- `ai/skills/auth-flow.md`: reset-токен хэшируется только HMAC, гасится
  атомарно.
- `ai/skills/security-review.md`: обязательный `expiresIn` на обоих токенах;
  фиктивная проверка хэша для защиты от тайминг-энумерации.
- `ai/skills/mongoose-models.md`: уже документирует `unique: true` для
  `user.email` — сверить, что текст не противоречит новому поведению 409
  (перехват `E11000` в сервисе).
- `README.md`: не требует правок по сути auth-модели (уже описывает
  refresh-куку и stateless-схему); проверить, что ничего не противоречит.

## Верификация

- `npm run lint`
- `npm run build`
- Ручной прогон через dev-сервер: register → login → new-tokens → logout;
  двойной reset одним токеном; повторная регистрация того же email.
