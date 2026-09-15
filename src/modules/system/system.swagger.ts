import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { createPropertyDocsDecorator } from '@shared/swagger'

export function SystemTagDocs() {
  return ApiTags('System')
}

export const SystemHelloMessagePropertyDocs = createPropertyDocsDecorator({
  description: 'Приветственное сообщение с указанием API.',
  example: 'Swoosh API',
})

export const SystemHealthStatusPropertyDocs = createPropertyDocsDecorator({
  description: 'Статус доступности. Всегда "ok", если процесс отвечает.',
  example: 'ok',
})

export const SystemHealthTimestampPropertyDocs = createPropertyDocsDecorator({
  description: 'Время сервера на момент проверки, в формате ISO-8601.',
  example: '2026-03-24T10:00:00.000Z',
})

export class SystemHelloResponseDocs {
  @SystemHelloMessagePropertyDocs()
  message!: string
}

export class SystemHealthResponseDocs {
  @SystemHealthStatusPropertyDocs()
  status!: string

  @SystemHealthTimestampPropertyDocs()
  timestamp!: string
}

export function SystemHelloDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Приветственное сообщение API',
      description:
        'Публичный эндпоинт, возвращающий приветственное сообщение API.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Приветственное сообщение успешно получено.',
      type: SystemHelloResponseDocs,
    }),
  )
}

export function SystemHealthDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Проверка доступности (liveness)',
      description:
        'Публичный эндпоинт, подтверждающий что процесс запущен. Не проверяет зависимости (Mongo и т.д.) — только liveness, не readiness.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Сервис доступен.',
      type: SystemHealthResponseDocs,
    }),
  )
}
