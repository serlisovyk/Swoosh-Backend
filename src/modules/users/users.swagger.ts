import { ErrorResponseDocs } from '@common/errors'
import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  ApiAuthRequiredDocs,
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
} from '@common/swagger'
import { FavoritesProductIdsPropertyDocs } from '@modules/favorites/favorites.swagger'
import { ROLES } from './users.types'

export function UsersTagDocs() {
  return ApiTags('Profile')
}

export const UsersNamePropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'User display name.',
  example: 'John Doe',
})

export const UsersNameRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'User display name.',
  example: 'John Doe',
})

export const UsersEmailPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'User email address.',
  example: 'john.swoosh@example.com',
})

export const UsersEmailRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'User email address.',
  example: 'john.swoosh@example.com',
})

export const UsersPhonePropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'User phone number.',
  example: '+380991112233',
})

export const UsersPhoneRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'User phone number.',
  example: '+380991112233',
})

export const UsersNewPasswordPropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description:
      'New password. When provided, currentPassword must also be sent.',
    example: 'newSecret123',
    minLength: 6,
  },
)

export const UsersCurrentPasswordPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Current password used to confirm password change.',
    example: 'secret123',
  })

export const UsersRolePropertyDocs = createPropertyDocsDecorator({
  description: 'User role.',
  enum: ROLES,
  enumName: 'UserRoles',
  example: ROLES.USER,
})

export const UsersIdPropertyDocs = createPropertyDocsDecorator({
  description: 'User identifier.',
  example: '65f1e8d3f9a2b56789c54321',
})

export const UsersAddressCompanyPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Company name for delivery details.',
    example: 'Swoosh',
  })

export const UsersAddressCompanyRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Company name for delivery details.',
    example: 'Swoosh',
  })

export const UsersAddressRegionPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Region for delivery details.',
    example: 'Kyiv region',
  })

export const UsersAddressRegionRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Region for delivery details.',
    example: 'Kyiv region',
  })

export const UsersAddressCityPropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'City for delivery details.',
    example: 'Kyiv',
  },
)

export const UsersAddressCityRequiredPropertyDocs = createPropertyDocsDecorator(
  {
    description: 'City for delivery details.',
    example: 'Kyiv',
  },
)

export const UsersAddressStreetPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Street for delivery details.',
    example: 'Khreshchatyk St',
  })

export const UsersAddressStreetRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Street for delivery details.',
    example: 'Khreshchatyk St',
  })

export const UsersAddressZipPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Postal code for delivery details.',
  example: '01001',
})

export const UsersAddressZipRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Postal code for delivery details.',
  example: '01001',
})

export const UsersAddressBuildingNumberPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Building or apartment number for delivery details.',
    example: '15A',
  })

export const UsersAddressBuildingNumberRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Building or apartment number for delivery details.',
    example: '15A',
  })

export function UsersAddressPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'User delivery address.',
    type: model,
  })
}

export function UsersAddressOptionalPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'User delivery address.',
    type: model,
    required: false,
  })
}

export class UsersAddressResponseDocs {
  @UsersAddressCompanyRequiredPropertyDocs()
  company?: string

  @UsersAddressRegionRequiredPropertyDocs()
  region?: string

  @UsersAddressCityRequiredPropertyDocs()
  city?: string

  @UsersAddressStreetRequiredPropertyDocs()
  street?: string

  @UsersAddressZipRequiredPropertyDocs()
  zip?: string

  @UsersAddressBuildingNumberRequiredPropertyDocs()
  buildingNumber?: string
}

export class UsersResponseDocs {
  @UsersIdPropertyDocs()
  _id!: string

  @UsersEmailRequiredPropertyDocs()
  email!: string

  @UsersNameRequiredPropertyDocs()
  name?: string

  @UsersPhoneRequiredPropertyDocs()
  phone?: string

  @UsersRolePropertyDocs()
  role!: ROLES

  @FavoritesProductIdsPropertyDocs()
  favoriteProductIds!: string[]

  @UsersAddressPropertyDocs(UsersAddressResponseDocs)
  address?: UsersAddressResponseDocs
}

export function UsersGetProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current user profile' }),
    ApiOkResponse({
      description: 'Current user profile returned successfully.',
      type: UsersResponseDocs,
    }),
    ApiAuthRequiredDocs(),
  )
}

export function UsersUpdateProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update current user profile' }),
    ApiOkResponse({
      description: 'Current user profile updated successfully.',
      type: UsersResponseDocs,
    }),
    ApiBadRequestResponse({
      description:
        'Request body is invalid, current password is missing, or email is already taken.',
      type: ErrorResponseDocs,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required or current password is wrong.',
      type: ErrorResponseDocs,
    }),
  )
}
