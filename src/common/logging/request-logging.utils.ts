import { randomUUID } from 'crypto'
import { HttpStatus, Logger } from '@nestjs/common'
import type { Request } from 'express'
import {
  REQUEST_ID_HEADER,
  REQUEST_ID_PATTERN,
} from './request-logging.constants'
import { RequestLogPayload } from './request-logging.types'

const logger = new Logger('RequestLogging')

export function resolveRequestId(request: Request): string {
  const header = request.headers[REQUEST_ID_HEADER]

  const incoming = Array.isArray(header) ? header[0] : header

  if (incoming && REQUEST_ID_PATTERN.test(incoming)) {
    return incoming
  }

  return randomUUID()
}

export function logRequest(payload: RequestLogPayload) {
  const message = JSON.stringify(payload)

  if (payload.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    logger.error(message)
    return
  }

  if (payload.statusCode >= HttpStatus.BAD_REQUEST) {
    logger.warn(message)
    return
  }

  logger.debug(message)
}
