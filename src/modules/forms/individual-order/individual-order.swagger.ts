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
  DEFAULT_INDIVIDUAL_ORDERS_LIMIT,
  INDIVIDUAL_ORDER_ID_EXAMPLE,
} from './individual-order.constants'
import { INDIVIDUAL_ORDER_STATUSES } from './individual-order.types'

export function IndividualOrderTagDocs() {
  return ApiTags('Individual Orders')
}

export const IndividualOrderNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Имя клиента.',
  example: 'Ivan Petrov',
})

export const IndividualOrderPhonePropertyDocs = createPropertyDocsDecorator({
  description: 'Номер телефона клиента после нормализации на сервере.',
  example: '+380501234567',
})

export const IndividualOrderEmailPropertyDocs = createPropertyDocsDecorator({
  description: 'Email клиента.',
  example: 'ivan.petrov@example.com',
})

export const IndividualOrderMessagePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Дополнительное сообщение клиента или предпочтительные способы связи.',
    example: 'Please contact me in Telegram after 18:00.',
  })

export const IndividualOrderStatusPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Текущий статус обработки индивидуального заказа.',
    enum: INDIVIDUAL_ORDER_STATUSES,
    enumName: 'IndividualOrderStatuses',
    example: INDIVIDUAL_ORDER_STATUSES.NEW,
  })

export const IndividualOrderStatusRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Текущий статус обработки индивидуального заказа.',
    enum: INDIVIDUAL_ORDER_STATUSES,
    enumName: 'IndividualOrderStatuses',
    example: INDIVIDUAL_ORDER_STATUSES.NEW,
  })

export const IndividualOrderResponseIdPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Идентификатор индивидуального заказа.',
    example: INDIVIDUAL_ORDER_ID_EXAMPLE,
  })

export const IndividualOrderCreatedAtPropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Время создания.',
    example: '2026-03-24T10:00:00.000Z',
  },
)

export const IndividualOrderUpdatedAtPropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Время последнего обновления.',
    example: '2026-03-24T10:15:00.000Z',
  },
)

export const IndividualOrderQuerySearchPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Полнотекстовый поиск по имени, email или телефону. Доступно только администраторам.',
    example: '38050',
  })

export const IndividualOrderQueryStatusPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Фильтр по статусу заказа. Доступно только администраторам.',
    enum: INDIVIDUAL_ORDER_STATUSES,
    enumName: 'IndividualOrderStatusesFilter',
    example: INDIVIDUAL_ORDER_STATUSES.NEW,
  })

export const IndividualOrderQueryLimitPropertyDocs = QueryLimitPropertyDocs({
  description: 'Максимальное количество заказов на странице.',
  example: DEFAULT_INDIVIDUAL_ORDERS_LIMIT,
  maximum: LIST_QUERY_MAX_LIMIT,
})

export const IndividualOrderQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Стратегия сортировки списка заказов.',
    enum: CREATED_AT_SORT_OPTIONS,
    enumName: 'IndividualOrderSortOptions',
    example: CREATED_AT_SORT_OPTIONS.NEWEST,
  })

export function IndividualOrderListItemsPropertyDocs(model: Type<unknown>) {
  return createPropertyDocsDecorator({
    description: 'Индивидуальные заказы, соответствующие текущим фильтрам.',
    type: [model],
  })()
}

export const IndividualOrderTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Общее количество найденных индивидуальных заказов.',
  example: 24,
})

export class IndividualOrderResponseDocs {
  @IndividualOrderResponseIdPropertyDocs()
  _id!: string

  @IndividualOrderNamePropertyDocs()
  name!: string

  @IndividualOrderPhonePropertyDocs()
  phone!: string

  @IndividualOrderEmailPropertyDocs()
  email!: string

  @IndividualOrderMessagePropertyDocs()
  message?: string

  @IndividualOrderStatusRequiredPropertyDocs()
  status!: string

  @IndividualOrderCreatedAtPropertyDocs()
  createdAt!: string

  @IndividualOrderUpdatedAtPropertyDocs()
  updatedAt!: string
}

export class IndividualOrderListResponseDocs {
  @IndividualOrderListItemsPropertyDocs(IndividualOrderResponseDocs)
  individualOrders!: IndividualOrderResponseDocs[]

  @IndividualOrderTotalPropertyDocs()
  total!: number
}

export function IndividualOrderCreateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Создать индивидуальный заказ',
      description:
        'Публичный эндпоинт для отправки формы индивидуального заказа.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'Индивидуальный заказ успешно создан.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiValidationErrorDocs(),
  )
}

export function IndividualOrderFindAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить список индивидуальных заказов',
      description:
        'Возвращает постраничный список индивидуальных заказов для администраторов.',
    }),
    ApiOkResponse({
      description: 'Список индивидуальных заказов успешно получен.',
      type: IndividualOrderListResponseDocs,
    }),
    ApiInvalidQueryDocs(),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description:
        'Только администраторы могут просматривать индивидуальные заказы.',
      type: ErrorResponseDocs,
    }),
  )
}

export function IndividualOrderFindByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить индивидуальный заказ по id',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId индивидуального заказа.',
      example: INDIVIDUAL_ORDER_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Индивидуальный заказ успешно получен.',
      type: IndividualOrderResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный формат id индивидуального заказа.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description:
        'Только администраторы могут просматривать индивидуальные заказы.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Индивидуальный заказ с указанным id не найден.',
      type: ErrorResponseDocs,
    }),
  )
}

export function IndividualOrderUpdateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Обновить индивидуальный заказ',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId индивидуального заказа.',
      example: INDIVIDUAL_ORDER_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Индивидуальный заказ успешно обновлён.',
      type: IndividualOrderResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный id индивидуального заказа или тело запроса.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description:
        'Только администраторы могут обновлять индивидуальные заказы.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Индивидуальный заказ с указанным id не найден.',
      type: ErrorResponseDocs,
    }),
  )
}

export function IndividualOrderDeleteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Удалить индивидуальный заказ',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId индивидуального заказа.',
      example: INDIVIDUAL_ORDER_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Индивидуальный заказ успешно удалён.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiBadRequestResponse({
      description: 'Некорректный формат id индивидуального заказа.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут удалять индивидуальные заказы.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Индивидуальный заказ с указанным id не найден.',
      type: ErrorResponseDocs,
    }),
  )
}
