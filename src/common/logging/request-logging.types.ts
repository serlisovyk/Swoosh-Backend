import type { HttpStatus } from '@nestjs/common'

export interface RequestLogPayload {
  requestId: string
  method: string
  path: string
  statusCode: HttpStatus
  durationMs: number
}
