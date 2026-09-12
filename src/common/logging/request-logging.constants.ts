import { LogLevel } from '@nestjs/common'
import { API_PREFIX } from '@shared/constants'

export const REQUEST_ID_HEADER = 'x-request-id'

export const REQUEST_ID_PATTERN = /^[\w-]{1,128}$/

export const SKIP_LOGGING_PATHS = [`/${API_PREFIX}`, `/${API_PREFIX}/health`]

export const PRODUCTION_LOG_LEVELS: LogLevel[] = ['log', 'warn', 'error']
