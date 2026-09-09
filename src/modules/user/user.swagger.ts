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
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
} from '@common/swagger'
import { FavoritesProductIdsPropertyDocs } from '@modules/favorites/favorites.swagger'
import {
  USER_ADDRESS_BUILDING_NUMBER_EXAMPLE,
  USER_ADDRESS_CITY_EXAMPLE,
  USER_ADDRESS_COMPANY_EXAMPLE,
  USER_ADDRESS_REGION_EXAMPLE,
  USER_ADDRESS_STREET_EXAMPLE,
  USER_ADDRESS_ZIP_EXAMPLE,
  USER_EMAIL_EXAMPLE,
  USER_ID_EXAMPLE,
  USER_NAME_EXAMPLE,
  USER_PHONE_EXAMPLE,
} from './user.constants'
import { ROLES } from './user.types'

export function UserTagDocs() {
  return ApiTags('Profile')
}

export const UserNamePropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'User display name.',
  example: USER_NAME_EXAMPLE,
})

export const UserNameRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'User display name.',
  example: USER_NAME_EXAMPLE,
})

export const UserEmailPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'User email address.',
  example: USER_EMAIL_EXAMPLE,
})

export const UserEmailRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'User email address.',
  example: USER_EMAIL_EXAMPLE,
})

export const UserPhonePropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'User phone number.',
  example: USER_PHONE_EXAMPLE,
})

export const UserPhoneRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'User phone number.',
  example: USER_PHONE_EXAMPLE,
})

export const UserNewPasswordPropertyDocs = createOptionalPropertyDocsDecorator({
  description:
    'New password. When provided, currentPassword must also be sent.',
  example: 'newSecret123',
  minLength: 6,
})

export const UserCurrentPasswordPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Current password used to confirm password change.',
    example: 'secret123',
  })

export const UserRolePropertyDocs = createPropertyDocsDecorator({
  description: 'User role.',
  enum: ROLES,
  enumName: 'UserRoles',
  example: ROLES.USER,
})

export const UserIdPropertyDocs = createPropertyDocsDecorator({
  description: 'User identifier.',
  example: USER_ID_EXAMPLE,
})

export const UserAddressCompanyPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Company name for delivery details.',
    example: USER_ADDRESS_COMPANY_EXAMPLE,
  })

export const UserAddressCompanyRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Company name for delivery details.',
    example: USER_ADDRESS_COMPANY_EXAMPLE,
  })

export const UserAddressRegionPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Region for delivery details.',
    example: USER_ADDRESS_REGION_EXAMPLE,
  })

export const UserAddressRegionRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Region for delivery details.',
    example: USER_ADDRESS_REGION_EXAMPLE,
  })

export const UserAddressCityPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'City for delivery details.',
  example: USER_ADDRESS_CITY_EXAMPLE,
})

export const UserAddressCityRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'City for delivery details.',
  example: USER_ADDRESS_CITY_EXAMPLE,
})

export const UserAddressStreetPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Street for delivery details.',
    example: USER_ADDRESS_STREET_EXAMPLE,
  })

export const UserAddressStreetRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Street for delivery details.',
    example: USER_ADDRESS_STREET_EXAMPLE,
  })

export const UserAddressZipPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Postal code for delivery details.',
  example: USER_ADDRESS_ZIP_EXAMPLE,
})

export const UserAddressZipRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Postal code for delivery details.',
  example: USER_ADDRESS_ZIP_EXAMPLE,
})

export const UserAddressBuildingNumberPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Building or apartment number for delivery details.',
    example: USER_ADDRESS_BUILDING_NUMBER_EXAMPLE,
  })

export const UserAddressBuildingNumberRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Building or apartment number for delivery details.',
    example: USER_ADDRESS_BUILDING_NUMBER_EXAMPLE,
  })

export function UserAddressPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'User delivery address.',
    type: model,
  })
}

export function UserAddressOptionalPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'User delivery address.',
    type: model,
    required: false,
  })
}

export class UserAddressResponseDocs {
  @UserAddressCompanyRequiredPropertyDocs()
  company?: string

  @UserAddressRegionRequiredPropertyDocs()
  region?: string

  @UserAddressCityRequiredPropertyDocs()
  city?: string

  @UserAddressStreetRequiredPropertyDocs()
  street?: string

  @UserAddressZipRequiredPropertyDocs()
  zip?: string

  @UserAddressBuildingNumberRequiredPropertyDocs()
  buildingNumber?: string
}

export class UserResponseDocs {
  @UserIdPropertyDocs()
  _id!: string

  @UserEmailRequiredPropertyDocs()
  email!: string

  @UserNameRequiredPropertyDocs()
  name?: string

  @UserPhoneRequiredPropertyDocs()
  phone?: string

  @UserRolePropertyDocs()
  role!: ROLES

  @FavoritesProductIdsPropertyDocs()
  favoriteProductIds!: string[]

  @UserAddressPropertyDocs(UserAddressResponseDocs)
  address?: UserAddressResponseDocs
}

export function UserGetProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current user profile' }),
    ApiOkResponse({
      description: 'Current user profile returned successfully.',
      type: UserResponseDocs,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
  )
}

export function UserUpdateProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update current user profile' }),
    ApiOkResponse({
      description: 'Current user profile updated successfully.',
      type: UserResponseDocs,
    }),
    ApiBadRequestResponse({
      description:
        'Request body is invalid, current password is missing, or email is already taken.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required or current password is wrong.',
    }),
  )
}
