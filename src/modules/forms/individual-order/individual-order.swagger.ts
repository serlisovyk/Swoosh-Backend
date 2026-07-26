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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
} from '@common/swagger'
import { INDIVIDUAL_ORDER_ID_EXAMPLE } from './individual-order.constants'
import {
  INDIVIDUAL_ORDER_SORT_OPTIONS,
  INDIVIDUAL_ORDER_STATUSES,
} from './individual-order.types'

export function IndividualOrderTagDocs() {
  return ApiTags('Individual Orders')
}

export const IndividualOrderNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Customer name.',
  example: 'Ivan Petrov',
})

export const IndividualOrderPhonePropertyDocs = createPropertyDocsDecorator({
  description: 'Customer phone number after server-side normalization.',
  example: '+380501234567',
})

export const IndividualOrderEmailPropertyDocs = createPropertyDocsDecorator({
  description: 'Customer email address.',
  example: 'ivan.petrov@example.com',
})

export const IndividualOrderMessagePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Additional customer message or preferred contact details.',
    example: 'Please contact me in Telegram after 18:00.',
  })

export const IndividualOrderStatusPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Current processing status of the individual order.',
    enum: INDIVIDUAL_ORDER_STATUSES,
    enumName: 'IndividualOrderStatuses',
    example: INDIVIDUAL_ORDER_STATUSES.NEW,
  })

export const IndividualOrderStatusRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Current processing status of the individual order.',
    enum: INDIVIDUAL_ORDER_STATUSES,
    enumName: 'IndividualOrderStatuses',
    example: INDIVIDUAL_ORDER_STATUSES.NEW,
  })

export const IndividualOrderResponseIdPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Individual order identifier.',
    example: INDIVIDUAL_ORDER_ID_EXAMPLE,
  })

export const IndividualOrderCreatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Creation timestamp.',
    example: '2026-03-24T10:00:00.000Z',
  })

export const IndividualOrderUpdatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Last update timestamp.',
    example: '2026-03-24T10:15:00.000Z',
  })

export const IndividualOrderQuerySearchPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Free-text search by name, email, or phone. Available only for admins.',
    example: '38050',
  })

export const IndividualOrderQueryStatusPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Filter by order status. Available only for admins.',
    enum: INDIVIDUAL_ORDER_STATUSES,
    enumName: 'IndividualOrderStatusesFilter',
    example: INDIVIDUAL_ORDER_STATUSES.NEW,
  })

export const IndividualOrderQueryPagePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Results page number. Available only for admins.',
    example: 1,
    minimum: 1,
  })

export const IndividualOrderQueryLimitPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Maximum number of orders returned per page.',
    example: 20,
    minimum: 1,
    maximum: 100,
  })

export const IndividualOrderQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Sorting strategy for the orders list.',
    enum: INDIVIDUAL_ORDER_SORT_OPTIONS,
    enumName: 'IndividualOrderSortOptions',
    example: INDIVIDUAL_ORDER_SORT_OPTIONS.NEWEST,
  })

export function IndividualOrderListItemsPropertyDocs(model: Type<unknown>) {
  return createPropertyDocsDecorator({
    description: 'Individual orders matching the current filters.',
    type: [model],
  })()
}

export const IndividualOrderTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Total number of matching individual orders.',
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
      summary: 'Create individual order',
      description: 'Public endpoint for submitting an individual order form.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'Individual order created successfully.',
      type: IndividualOrderResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Request body validation failed.',
    }),
  )
}

export function IndividualOrderFindAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get individual orders list',
      description: 'Returns a paginated list of individual orders for admins.',
    }),
    ApiOkResponse({
      description: 'Individual orders returned successfully.',
      type: IndividualOrderListResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'One or more query parameters are invalid.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can access individual orders.',
    }),
  )
}

export function IndividualOrderFindByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get individual order by id',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the individual order.',
      example: INDIVIDUAL_ORDER_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Individual order returned successfully.',
      type: IndividualOrderResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Individual order id has an invalid format.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can access individual orders.',
    }),
    ApiNotFoundResponse({
      description: 'Individual order with the provided id was not found.',
    }),
  )
}

export function IndividualOrderUpdateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update individual order',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the individual order.',
      example: INDIVIDUAL_ORDER_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Individual order updated successfully.',
      type: IndividualOrderResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Individual order id or request body is invalid.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can update individual orders.',
    }),
    ApiNotFoundResponse({
      description: 'Individual order with the provided id was not found.',
    }),
  )
}

export function IndividualOrderDeleteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete individual order',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the individual order.',
      example: INDIVIDUAL_ORDER_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Individual order deleted successfully.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiBadRequestResponse({
      description: 'Individual order id has an invalid format.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can delete individual orders.',
    }),
    ApiNotFoundResponse({
      description: 'Individual order with the provided id was not found.',
    }),
  )
}
