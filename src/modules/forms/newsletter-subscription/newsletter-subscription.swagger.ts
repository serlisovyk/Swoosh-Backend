import {
  ApiAuthRequiredDocs,
  ApiInvalidQueryDocs,
  ApiValidationErrorDocs,
  ErrorResponseDocs,
} from '@common/errors'
import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
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
  DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT,
  NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
} from './newsletter-subscription.constants'

export function NewsletterSubscriptionTagDocs() {
  return ApiTags('Newsletter Subscriptions')
}

export const NewsletterSubscriptionEmailPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Email подписчика рассылки.',
    example: 'john.swoosh@example.com',
  })

export const NewsletterSubscriptionResponseIdPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Идентификатор подписки на рассылку.',
    example: NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
  })

export const NewsletterSubscriptionCreatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Время создания.',
    example: '2026-03-24T10:00:00.000Z',
  })

export const NewsletterSubscriptionUpdatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Время последнего обновления.',
    example: '2026-03-24T10:15:00.000Z',
  })

export const NewsletterSubscriptionQuerySearchPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Полнотекстовый поиск по email. Доступно только администраторам.',
    example: 'john.swoosh',
  })

export const NewsletterSubscriptionQueryLimitPropertyDocs =
  QueryLimitPropertyDocs({
    description: 'Максимальное количество подписок на странице.',
    example: DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT,
    maximum: LIST_QUERY_MAX_LIMIT,
  })

export const NewsletterSubscriptionQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Стратегия сортировки списка подписок на рассылку.',
    enum: CREATED_AT_SORT_OPTIONS,
    enumName: 'NewsletterSubscriptionSortOptions',
    example: CREATED_AT_SORT_OPTIONS.NEWEST,
  })

export function NewsletterSubscriptionListItemsPropertyDocs(
  model: Type<unknown>,
) {
  return createPropertyDocsDecorator({
    description:
      'Подписки на рассылку, соответствующие текущим фильтрам администратора.',
    type: [model],
  })()
}

export const NewsletterSubscriptionTotalPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Общее количество найденных подписок на рассылку.',
    example: 24,
  })

export class NewsletterSubscriptionResponseDocs {
  @NewsletterSubscriptionResponseIdPropertyDocs()
  _id!: string

  @NewsletterSubscriptionEmailPropertyDocs()
  email!: string

  @NewsletterSubscriptionCreatedAtPropertyDocs()
  createdAt!: string

  @NewsletterSubscriptionUpdatedAtPropertyDocs()
  updatedAt!: string
}

export class NewsletterSubscriptionListResponseDocs {
  @NewsletterSubscriptionListItemsPropertyDocs(
    NewsletterSubscriptionResponseDocs,
  )
  newsletterSubscriptions!: NewsletterSubscriptionResponseDocs[]

  @NewsletterSubscriptionTotalPropertyDocs()
  total!: number
}

export function NewsletterSubscriptionCreateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Создать подписку на рассылку',
      description: 'Публичный эндпоинт для подписки email-адреса на рассылку.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'Подписка на рассылку успешно обработана.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiValidationErrorDocs(),
  )
}

export function NewsletterSubscriptionFindAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить список подписок на рассылку',
      description:
        'Возвращает постраничный список подписок на рассылку для администраторов.',
    }),
    ApiOkResponse({
      description: 'Список подписок на рассылку успешно получен.',
      type: NewsletterSubscriptionListResponseDocs,
    }),
    ApiInvalidQueryDocs(),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description:
        'Только администраторы могут просматривать подписки на рассылку.',
      type: ErrorResponseDocs,
    }),
  )
}

export function NewsletterSubscriptionFindByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить подписку на рассылку по id',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId подписки на рассылку.',
      example: NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Подписка на рассылку успешно получена.',
      type: NewsletterSubscriptionResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный формат id подписки на рассылку.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description:
        'Только администраторы могут просматривать подписки на рассылку.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Подписка на рассылку с указанным id не найдена.',
      type: ErrorResponseDocs,
    }),
  )
}

export function NewsletterSubscriptionUpdateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Обновить подписку на рассылку',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId подписки на рассылку.',
      example: NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Подписка на рассылку успешно обновлена.',
      type: NewsletterSubscriptionResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный id подписки на рассылку или тело запроса.',
      type: ErrorResponseDocs,
    }),
    ApiConflictResponse({
      description: 'Указанный email уже подписан.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description:
        'Только администраторы могут обновлять подписки на рассылку.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Подписка на рассылку с указанным id не найдена.',
      type: ErrorResponseDocs,
    }),
  )
}

export function NewsletterSubscriptionDeleteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Удалить подписку на рассылку',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId подписки на рассылку.',
      example: NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Подписка на рассылку успешно удалена.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiBadRequestResponse({
      description: 'Некорректный формат id подписки на рассылку.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут удалять подписки на рассылку.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Подписка на рассылку с указанным id не найдена.',
      type: ErrorResponseDocs,
    }),
  )
}
