import { HttpStatus } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { logRequest, resolveRequestId } from './request-logging.utils'
import {
  REQUEST_ID_HEADER,
  SKIP_LOGGING_PATHS,
} from './request-logging.constants'

export function requestLoggingMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const requestId = resolveRequestId(request)

  request.requestId = requestId
  response.setHeader(REQUEST_ID_HEADER, requestId)

  const startTime = Date.now()

  response.on('finish', () => {
    const statusCode: HttpStatus = response.statusCode

    if (
      SKIP_LOGGING_PATHS.includes(request.path) &&
      statusCode < HttpStatus.BAD_REQUEST
    ) {
      return
    }

    logRequest({
      requestId,
      method: request.method,
      path: request.path,
      statusCode,
      durationMs: Date.now() - startTime,
    })
  })

  next()
}
