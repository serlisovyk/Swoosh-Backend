import {
  ApiAuthRequiredDocs,
  ApiInvalidQueryDocs,
  ApiValidationErrorDocs,
  ErrorResponseDocs,
} from '@common/errors'
import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import {
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
  QueryLimitPropertyDocs,
} from '@shared/swagger'
import { LIST_QUERY_MAX_LIMIT } from '@shared/constants'
import { CREATED_AT_SORT_OPTIONS } from '@shared/types'
import {
  CONTACT_REQUEST_ID_EXAMPLE,
  DEFAULT_CONTACT_REQUESTS_LIMIT,
} from './contact-request.constants'

export function ContactRequestTagDocs() {
  return ApiTags('Contact Requests')
}

export const ContactRequestNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Имя отправителя из формы обратной связи.',
  example: 'John Swoosh',
})

export const ContactRequestEmailPropertyDocs = createPropertyDocsDecorator({
  description: 'Email отправителя из формы обратной связи.',
  example: 'john.swoosh@example.com',
})

export const ContactRequestMessagePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Необязательное сообщение из формы обратной связи.',
    example: 'I want to clarify delivery terms for a recent order.',
  })

export const ContactRequestResponseIdPropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Идентификатор обращения.',
    example: CONTACT_REQUEST_ID_EXAMPLE,
  },
)

export const ContactRequestCreatedAtPropertyDocs = createPropertyDocsDecorator({
  description: 'Время создания.',
  example: '2026-04-10T10:00:00.000Z',
})

export const ContactRequestUpdatedAtPropertyDocs = createPropertyDocsDecorator({
  description: 'Время последнего обновления.',
  example: '2026-04-10T10:15:00.000Z',
})

export const ContactRequestQuerySearchPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Полнотекстовый поиск по имени, email или сообщению. Доступно только администраторам.',
    example: 'delivery',
  })

export const ContactRequestQueryLimitPropertyDocs = QueryLimitPropertyDocs({
  description: 'Максимальное количество обращений на странице.',
  example: DEFAULT_CONTACT_REQUESTS_LIMIT,
  maximum: LIST_QUERY_MAX_LIMIT,
})

export const ContactRequestQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Стратегия сортировки списка обращений.',
    enum: CREATED_AT_SORT_OPTIONS,
    enumName: 'ContactRequestSortOptions',
    example: CREATED_AT_SORT_OPTIONS.NEWEST,
  })

export function ContactRequestListItemsPropertyDocs(model: Type<unknown>) {
  return createPropertyDocsDecorator({
    description: 'Обращения, соответствующие текущим фильтрам администратора.',
    type: [model],
  })()
}

export const ContactRequestTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Общее количество найденных обращений.',
  example: 24,
})

export class ContactRequestResponseDocs {
  @ContactRequestResponseIdPropertyDocs()
  _id!: string

  @ContactRequestNamePropertyDocs()
  name!: string

  @ContactRequestEmailPropertyDocs()
  email!: string

  @ContactRequestMessagePropertyDocs()
  message?: string

  @ContactRequestCreatedAtPropertyDocs()
  createdAt!: string

  @ContactRequestUpdatedAtPropertyDocs()
  updatedAt!: string
}

export class ContactRequestListResponseDocs {
  @ContactRequestListItemsPropertyDocs(ContactRequestResponseDocs)
  contactRequests!: ContactRequestResponseDocs[]

  @ContactRequestTotalPropertyDocs()
  total!: number
}

export function ContactRequestCreateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Создать обращение',
      description:
        'Публичный эндпоинт для отправки сообщения через форму обратной связи.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'Обращение успешно обработано.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiValidationErrorDocs(),
  )
}

export function ContactRequestFindAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить список обращений',
      description:
        'Возвращает постраничный список обращений для администраторов.',
    }),
    ApiOkResponse({
      description: 'Список обращений успешно получен.',
      type: ContactRequestListResponseDocs,
    }),
    ApiInvalidQueryDocs(),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут просматривать обращения.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ContactRequestFindByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить обращение по id',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId обращения.',
      example: CONTACT_REQUEST_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Обращение успешно получено.',
      type: ContactRequestResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный формат id обращения.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут просматривать обращения.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Обращение с указанным id не найдено.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ContactRequestUpdateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Обновить обращение',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId обращения.',
      example: CONTACT_REQUEST_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Обращение успешно обновлено.',
      type: ContactRequestResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный id обращения или тело запроса.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут обновлять обращения.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Обращение с указанным id не найдено.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ContactRequestDeleteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Удалить обращение',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId обращения.',
      example: CONTACT_REQUEST_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Обращение успешно удалено.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiBadRequestResponse({
      description: 'Некорректный формат id обращения.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут удалять обращения.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Обращение с указанным id не найдено.',
      type: ErrorResponseDocs,
    }),
  )
}
