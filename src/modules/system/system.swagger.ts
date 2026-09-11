import { applyDecorators } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { createPropertyDocsDecorator } from '@common/swagger'

export function SystemTagDocs() {
  return ApiTags('System')
}

export const SystemHelloMessagePropertyDocs = createPropertyDocsDecorator({
  description: 'Welcome message identifying the API.',
  example: 'Swoosh API',
})

export const SystemHealthStatusPropertyDocs = createPropertyDocsDecorator({
  description: 'Liveness status. Always "ok" if the process can respond.',
  example: 'ok',
})

export const SystemHealthTimestampPropertyDocs = createPropertyDocsDecorator({
  description: 'Server time at the moment of the health check, ISO-8601.',
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
      summary: 'API welcome message',
      description: 'Public endpoint returning a welcome message for the API.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Welcome message returned successfully.',
      type: SystemHelloResponseDocs,
    }),
  )
}

export function SystemHealthDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Liveness health check',
      description:
        'Public endpoint reporting that the process is up. Does not check dependencies (Mongo, etc.) — liveness only, not readiness.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Service is alive.',
      type: SystemHealthResponseDocs,
    }),
  )
}
