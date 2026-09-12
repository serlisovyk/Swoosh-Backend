export interface RequestLogPayload {
  requestId: string
  method: string
  path: string
  statusCode: number
  durationMs: number
}
