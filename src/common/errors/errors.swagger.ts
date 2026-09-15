import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ERROR_CODES } from './error-codes.constants'

export class ErrorBodyDocs {
  @ApiProperty({
    description: 'Стабильный, машиночитаемый код ошибки.',
    enum: ERROR_CODES,
    example: ERROR_CODES.BAD_REQUEST,
  })
  code!: string

  @ApiProperty({
    description:
      'Краткое описание ошибки, понятное человеку, без внутренних деталей.',
    example: 'Неверные параметры запроса',
  })
  message!: string

  @ApiPropertyOptional({
    description:
      'Сообщения валидации по каждому полю, присутствуют только для VALIDATION_ERROR. Ошибки по всему объекту используют ключ "_root".',
    example: { page: 'Неверное значение: ожидалось число, получена строка' },
  })
  fields?: Record<string, string>
}

export class ErrorResponseDocs {
  @ApiProperty({ type: ErrorBodyDocs })
  error!: ErrorBodyDocs
}

export function ApiAuthRequiredDocs() {
  return ApiUnauthorizedResponse({
    description: 'Требуется аутентификация.',
    type: ErrorResponseDocs,
  })
}

export function ApiValidationErrorDocs() {
  return ApiBadRequestResponse({
    description: 'Валидация тела запроса не пройдена.',
    type: ErrorResponseDocs,
  })
}

export function ApiInvalidQueryDocs() {
  return ApiBadRequestResponse({
    description: 'Один или несколько параметров запроса недопустимы.',
    type: ErrorResponseDocs,
  })
}

export function ApiNotFoundDocs(entity: string) {
  return ApiNotFoundResponse({
    description: `Объект «${entity}» не найден.`,
    type: ErrorResponseDocs,
  })
}
