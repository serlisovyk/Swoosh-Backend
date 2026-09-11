import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ERROR_CODES } from './error-codes.constants'

export class ErrorBodyDocs {
  @ApiProperty({
    description: 'Stable, machine-readable error code.',
    enum: ERROR_CODES,
    example: ERROR_CODES.BAD_REQUEST,
  })
  code!: string

  @ApiProperty({
    description: 'Short human-readable summary, no internal details.',
    example: 'Invalid query parameters',
  })
  message!: string

  @ApiPropertyOptional({
    description:
      'Per-field validation messages, present only for VALIDATION_ERROR. Whole-object errors use the "_root" key.',
    example: { page: 'Invalid input: expected number, received string' },
  })
  fields?: Record<string, string>
}

export class ErrorResponseDocs {
  @ApiProperty({ type: ErrorBodyDocs })
  error!: ErrorBodyDocs
}
