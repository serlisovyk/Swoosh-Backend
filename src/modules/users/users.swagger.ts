import { ApiAuthRequiredDocs, ErrorResponseDocs } from '@common/errors'
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
} from '@shared/swagger'
import { FavoritesProductIdsPropertyDocs } from '@modules/favorites'
import { ROLES } from './users.types'

export function UsersTagDocs() {
  return ApiTags('Profile')
}

export const UsersNamePropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Отображаемое имя пользователя.',
  example: 'John Doe',
})

export const UsersNameRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Отображаемое имя пользователя.',
  example: 'John Doe',
})

export const UsersEmailPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Email пользователя.',
  example: 'john.swoosh@example.com',
})

export const UsersEmailRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Email пользователя.',
  example: 'john.swoosh@example.com',
})

export const UsersPhonePropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Номер телефона пользователя.',
  example: '+380991112233',
})

export const UsersPhoneRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Номер телефона пользователя.',
  example: '+380991112233',
})

export const UsersNewPasswordPropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'Новый пароль. При передаче также обязателен currentPassword.',
    example: 'newSecret123',
    minLength: 6,
  },
)

export const UsersCurrentPasswordPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Текущий пароль для подтверждения смены пароля.',
    example: 'secret123',
  })

export const UsersRolePropertyDocs = createPropertyDocsDecorator({
  description: 'Роль пользователя.',
  enum: ROLES,
  enumName: 'UserRoles',
  example: ROLES.USER,
})

export const UsersIdPropertyDocs = createPropertyDocsDecorator({
  description: 'Идентификатор пользователя.',
  example: '65f1e8d3f9a2b56789c54321',
})

export const UsersAddressCompanyPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Название компании для данных доставки.',
    example: 'Swoosh',
  })

export const UsersAddressCompanyRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Название компании для данных доставки.',
    example: 'Swoosh',
  })

export const UsersAddressRegionPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Регион для данных доставки.',
    example: 'Kyiv region',
  })

export const UsersAddressRegionRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Регион для данных доставки.',
    example: 'Kyiv region',
  })

export const UsersAddressCityPropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'Город для данных доставки.',
    example: 'Kyiv',
  },
)

export const UsersAddressCityRequiredPropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Город для данных доставки.',
    example: 'Kyiv',
  },
)

export const UsersAddressStreetPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Улица для данных доставки.',
    example: 'Khreshchatyk St',
  })

export const UsersAddressStreetRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Улица для данных доставки.',
    example: 'Khreshchatyk St',
  })

export const UsersAddressZipPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Почтовый индекс для данных доставки.',
  example: '01001',
})

export const UsersAddressZipRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Почтовый индекс для данных доставки.',
  example: '01001',
})

export const UsersAddressBuildingNumberPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Номер дома или квартиры для данных доставки.',
    example: '15A',
  })

export const UsersAddressBuildingNumberRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Номер дома или квартиры для данных доставки.',
    example: '15A',
  })

export function UsersAddressPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Адрес доставки пользователя.',
    type: model,
  })
}

export function UsersAddressOptionalPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Адрес доставки пользователя.',
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
    ApiOperation({ summary: 'Получить профиль текущего пользователя' }),
    ApiOkResponse({
      description: 'Профиль текущего пользователя успешно получен.',
      type: UsersResponseDocs,
    }),
    ApiAuthRequiredDocs(),
  )
}

export function UsersUpdateProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновить профиль текущего пользователя' }),
    ApiOkResponse({
      description: 'Профиль текущего пользователя успешно обновлён.',
      type: UsersResponseDocs,
    }),
    ApiBadRequestResponse({
      description:
        'Тело запроса невалидно, отсутствует текущий пароль, либо email уже занят.',
      type: ErrorResponseDocs,
    }),
    ApiUnauthorizedResponse({
      description: 'Требуется аутентификация либо неверный текущий пароль.',
      type: ErrorResponseDocs,
    }),
  )
}
