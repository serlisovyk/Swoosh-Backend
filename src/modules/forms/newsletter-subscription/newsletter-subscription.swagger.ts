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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
} from '@common/swagger'
import { NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE } from './newsletter-subscription.constants'
import { NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS } from './newsletter-subscription.types'

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

export const NewsletterSubscriptionQueryPagePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Results page number. Available only for admins.',
    example: 1,
    minimum: 1,
  })

export const NewsletterSubscriptionQueryLimitPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Maximum number of subscriptions returned per page.',
    example: 20,
    minimum: 1,
    maximum: 100,
  })

export const NewsletterSubscriptionQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Sorting strategy for the newsletter subscriptions list.',
    enum: NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS,
    enumName: 'NewsletterSubscriptionSortOptions',
    example: NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS.NEWEST,
  })

export function NewsletterSubscriptionListItemsPropertyDocs(
  model: Type<unknown>,
) {
  return createPropertyDocsDecorator({
    description:
      'Newsletter subscriptions matching the current admin filters.',
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
  @NewsletterSubscriptionListItemsPropertyDocs(NewsletterSubscriptionResponseDocs)
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
    ApiBadRequestResponse({
      description: 'Request body validation failed.',
    }),
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
    ApiBadRequestResponse({
      description: 'One or more query parameters are invalid.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can access newsletter subscriptions.',
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
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can access newsletter subscriptions.',
    }),
    ApiNotFoundResponse({
      description: 'Newsletter subscription with the provided id was not found.',
    }),
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
    }),
    ApiConflictResponse({
      description: 'The provided email is already subscribed.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can update newsletter subscriptions.',
    }),
    ApiNotFoundResponse({
      description: 'Newsletter subscription with the provided id was not found.',
    }),
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
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can delete newsletter subscriptions.',
    }),
    ApiNotFoundResponse({
      description: 'Newsletter subscription with the provided id was not found.',
    }),
  )
}
