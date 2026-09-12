import {
  ApiAuthRequiredDocs,
  ApiInvalidQueryDocs,
  ApiNotFoundDocs,
  ApiValidationErrorDocs,
  ErrorResponseDocs,
} from '@common/errors'
import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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
    description: 'Newsletter subscriber email address.',
    example: 'john.swoosh@example.com',
  })

export const NewsletterSubscriptionResponseIdPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Newsletter subscription identifier.',
    example: NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
  })

export const NewsletterSubscriptionCreatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Creation timestamp.',
    example: '2026-03-24T10:00:00.000Z',
  })

export const NewsletterSubscriptionUpdatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Last update timestamp.',
    example: '2026-03-24T10:15:00.000Z',
  })

export const NewsletterSubscriptionQuerySearchPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Free-text search by email. Available only for admins.',
    example: 'john.swoosh',
  })

export const NewsletterSubscriptionQueryLimitPropertyDocs =
  QueryLimitPropertyDocs({
    description: 'Maximum number of subscriptions returned per page.',
    example: DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT,
    maximum: LIST_QUERY_MAX_LIMIT,
  })

export const NewsletterSubscriptionQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Sorting strategy for the newsletter subscriptions list.',
    enum: CREATED_AT_SORT_OPTIONS,
    enumName: 'NewsletterSubscriptionSortOptions',
    example: CREATED_AT_SORT_OPTIONS.NEWEST,
  })

export function NewsletterSubscriptionListItemsPropertyDocs(
  model: Type<unknown>,
) {
  return createPropertyDocsDecorator({
    description: 'Newsletter subscriptions matching the current admin filters.',
    type: [model],
  })()
}

export const NewsletterSubscriptionTotalPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Total number of matching newsletter subscriptions.',
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
      summary: 'Create newsletter subscription',
      description:
        'Public endpoint for subscribing an email address to the newsletter list.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'Newsletter subscription processed successfully.',
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
      summary: 'Get newsletter subscriptions list',
      description:
        'Returns a paginated list of newsletter subscriptions for admins.',
    }),
    ApiOkResponse({
      description: 'Newsletter subscriptions returned successfully.',
      type: NewsletterSubscriptionListResponseDocs,
    }),
    ApiInvalidQueryDocs(),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Only admins can access newsletter subscriptions.',
      type: ErrorResponseDocs,
    }),
  )
}

export function NewsletterSubscriptionFindByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get newsletter subscription by id',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the newsletter subscription.',
      example: NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Newsletter subscription returned successfully.',
      type: NewsletterSubscriptionResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Newsletter subscription id has an invalid format.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Only admins can access newsletter subscriptions.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundDocs('Newsletter subscription with the provided id'),
  )
}

export function NewsletterSubscriptionUpdateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update newsletter subscription',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the newsletter subscription.',
      example: NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Newsletter subscription updated successfully.',
      type: NewsletterSubscriptionResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Newsletter subscription id or request body is invalid.',
      type: ErrorResponseDocs,
    }),
    ApiConflictResponse({
      description: 'The provided email is already subscribed.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Only admins can update newsletter subscriptions.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundDocs('Newsletter subscription with the provided id'),
  )
}

export function NewsletterSubscriptionDeleteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete newsletter subscription',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the newsletter subscription.',
      example: NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Newsletter subscription deleted successfully.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiBadRequestResponse({
      description: 'Newsletter subscription id has an invalid format.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Only admins can delete newsletter subscriptions.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundDocs('Newsletter subscription with the provided id'),
  )
}
