import { randomUUID } from 'crypto'
import { Logger } from '@nestjs/common'
import type { Request } from 'express'
import {
  BAD_REQUEST_STATUS,
  INTERNAL_SERVER_ERROR_STATUS,
} from '@common/errors'
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

  if (payload.statusCode >= INTERNAL_SERVER_ERROR_STATUS) {
    logger.error(message)
    return
  }

  if (payload.statusCode >= BAD_REQUEST_STATUS) {
    logger.warn(message)
    return
  }

  logger.debug(message)
}
