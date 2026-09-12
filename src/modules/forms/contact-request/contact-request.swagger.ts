import { ErrorResponseDocs } from '@common/errors'
import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import {
  ApiAuthRequiredDocs,
  ApiInvalidQueryDocs,
  ApiNotFoundDocs,
  ApiValidationErrorDocs,
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
  QueryLimitPropertyDocs,
} from '@common/swagger'
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
  description: 'Sender name from the contact form.',
  example: 'John Swoosh',
})

export const ContactRequestEmailPropertyDocs = createPropertyDocsDecorator({
  description: 'Sender email from the contact form.',
  example: 'john.swoosh@example.com',
})

export const ContactRequestMessagePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Optional message from the contact form.',
    example: 'I want to clarify delivery terms for a recent order.',
  })

export const ContactRequestResponseIdPropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Contact request identifier.',
    example: CONTACT_REQUEST_ID_EXAMPLE,
  },
)

export const ContactRequestCreatedAtPropertyDocs = createPropertyDocsDecorator({
  description: 'Creation timestamp.',
  example: '2026-04-10T10:00:00.000Z',
})

export const ContactRequestUpdatedAtPropertyDocs = createPropertyDocsDecorator({
  description: 'Last update timestamp.',
  example: '2026-04-10T10:15:00.000Z',
})

export const ContactRequestQuerySearchPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Free-text search by name, email, or message. Available only for admins.',
    example: 'delivery',
  })

export const ContactRequestQueryLimitPropertyDocs = QueryLimitPropertyDocs({
  description: 'Maximum number of contact requests returned per page.',
  example: DEFAULT_CONTACT_REQUESTS_LIMIT,
  maximum: LIST_QUERY_MAX_LIMIT,
})

export const ContactRequestQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Sorting strategy for the contact requests list.',
    enum: CREATED_AT_SORT_OPTIONS,
    enumName: 'ContactRequestSortOptions',
    example: CREATED_AT_SORT_OPTIONS.NEWEST,
  })

export function ContactRequestListItemsPropertyDocs(model: Type<unknown>) {
  return createPropertyDocsDecorator({
    description: 'Contact requests matching the current admin filters.',
    type: [model],
  })()
}

export const ContactRequestTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Total number of matching contact requests.',
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
      summary: 'Create contact request',
      description:
        'Public endpoint for sending a message through the contact form.',
      security: [],
    }),
    ApiCreatedResponse({
      description: 'Contact request processed successfully.',
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
      summary: 'Get contact requests list',
      description: 'Returns a paginated list of contact requests for admins.',
    }),
    ApiOkResponse({
      description: 'Contact requests returned successfully.',
      type: ContactRequestListResponseDocs,
    }),
    ApiInvalidQueryDocs(),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Only admins can access contact requests.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ContactRequestFindByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get contact request by id',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the contact request.',
      example: CONTACT_REQUEST_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Contact request returned successfully.',
      type: ContactRequestResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Contact request id has an invalid format.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Only admins can access contact requests.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundDocs('Contact request with the provided id'),
  )
}

export function ContactRequestUpdateDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update contact request',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the contact request.',
      example: CONTACT_REQUEST_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Contact request updated successfully.',
      type: ContactRequestResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Contact request id or request body is invalid.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Only admins can update contact requests.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundDocs('Contact request with the provided id'),
  )
}

export function ContactRequestDeleteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete contact request',
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the contact request.',
      example: CONTACT_REQUEST_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Contact request deleted successfully.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiBadRequestResponse({
      description: 'Contact request id has an invalid format.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Only admins can delete contact requests.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundDocs('Contact request with the provided id'),
  )
}
