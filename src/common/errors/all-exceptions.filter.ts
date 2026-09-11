import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import {
  ERROR_CODES,
  INTERNAL_SERVER_ERROR_STATUS,
  STATUS_TO_ERROR_CODE,
} from './error-codes.constants'
import { INTERNAL_ERROR_MESSAGE } from './errors.constants'
import { ErrorResponseBody } from './errors.types'
import { ValidationFailedException } from './validation-failed.exception'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()

    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()

    const status = this.resolveStatus(exception)
    const body = this.buildResponseBody(exception, status)

    if (status >= INTERNAL_SERVER_ERROR_STATUS) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    }

    response.status(status).json(body)
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus()
    }

    return HttpStatus.INTERNAL_SERVER_ERROR
  }

  private buildResponseBody(
    exception: unknown,
    status: number,
  ): ErrorResponseBody {
    if (exception instanceof ValidationFailedException) {
      return {
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: exception.message,
          fields: exception.fields,
        },
      }
    }

    if (
      status >= INTERNAL_SERVER_ERROR_STATUS ||
      !(exception instanceof HttpException)
    ) {
      return {
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: INTERNAL_ERROR_MESSAGE,
        },
      }
    }

    return {
      error: {
        code: STATUS_TO_ERROR_CODE[status] ?? ERROR_CODES.BAD_REQUEST,
        message: this.extractMessage(exception),
      },
    }
  }

  private extractMessage(exception: HttpException): string {
    const response = exception.getResponse()

    if (typeof response === 'string') {
      return response
    }

    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const { message } = response

      if (typeof message === 'string') {
        return message
      }

      if (Array.isArray(message)) {
        return message.join('; ')
      }
    }

    return exception.message
  }
}
