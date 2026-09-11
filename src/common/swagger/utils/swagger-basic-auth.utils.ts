import { timingSafeEqual } from 'crypto'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { SWAGGER_BASIC_AUTH_REALM } from '../constants'

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)

  if (bufferA.length !== bufferB.length) return false

  return timingSafeEqual(bufferA, bufferB)
}

function isAuthorized(
  header: string | undefined,
  user: string,
  password: string,
): boolean {
  const [scheme, credentials] = header?.split(' ') ?? []

  if (scheme !== 'Basic' || !credentials) return false

  const [providedUser, providedPassword] = Buffer.from(credentials, 'base64')
    .toString('utf-8')
    .split(':')

  if (providedUser === undefined || providedPassword === undefined) {
    return false
  }

  return (
    timingSafeStringEqual(providedUser, user) &&
    timingSafeStringEqual(providedPassword, password)
  )
}

// @nestjs/swagger serves the JSON/YAML spec at a sibling path
// (`${docsPathPrefix}-json`), not a sub-path of the docs UI. An
// Express-mounted middleware (`app.use(docsPathPrefix, ...)`) would not
// match that sibling, so this checks `req.path` directly and is
// registered as a global, unconditional `app.use(...)` instead.
export function createSwaggerBasicAuthMiddleware(
  docsPathPrefix: string,
  user: string,
  password: string,
): RequestHandler {
  return function swaggerBasicAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (!req.path.startsWith(docsPathPrefix)) {
      next()
      return
    }

    if (isAuthorized(req.headers.authorization, user, password)) {
      next()
      return
    }

    res.setHeader(
      'WWW-Authenticate',
      `Basic realm="${SWAGGER_BASIC_AUTH_REALM}"`,
    )
    res.status(401).send('Unauthorized')
  }
}
