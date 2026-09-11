import { ErrorCode } from './error-codes.constants'

export interface ErrorResponseBody {
  error: {
    code: ErrorCode
    message: string
    fields?: Record<string, string>
  }
}
