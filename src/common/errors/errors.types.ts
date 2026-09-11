import { ErrorCode } from './error-codes.constants'

export interface ErrorBody {
  code: ErrorCode
  message: string
  fields?: Record<string, string>
}

export interface ErrorResponseBody {
  error: ErrorBody
}
