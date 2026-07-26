export const USER_ALREADY_EXISTS_ERROR = 'Такой пользователь уже существует'
export const USER_NOT_FOUND_ERROR = 'Пользователь не найден'

export const USER_BASE_SELECT_FIELDS = '-createdAt -updatedAt -__v'
export const USER_PUBLIC_SELECT_FIELDS = USER_BASE_SELECT_FIELDS

export const EMAIL_STRING_ERROR = 'Email должен быть строкой'
export const EMAIL_FORMAT_ERROR = 'Некорректный формат email'
export const PASSWORD_STRING_ERROR = 'Пароль должен быть строкой'
export const PASSWORD_LENGTH_ERROR =
  'Пароль должен содержать минимум 6 символов'
export const NEW_PASSWORD_STRING_ERROR = 'Новый пароль должен быть строкой'
export const NEW_PASSWORD_LENGTH_ERROR =
  'Новый пароль должен содержать минимум 6 символов'
export const NAME_STRING_ERROR = 'Имя должно быть строкой'
export const PHONE_STRING_ERROR = 'Телефон должен быть строкой'
export const CURRENT_PASSWORD_REQUIRED_ERROR =
  'Для смены пароля необходимо указать текущий пароль'
export const WRONG_CURRENT_PASSWORD_ERROR = 'Неверный текущий пароль'
export const CURRENT_PASSWORD_STRING_ERROR =
  'Текущий пароль должен быть строкой'
export const ADDRESS_COMPANY_STRING_ERROR = 'Компания должна быть строкой'
export const ADDRESS_REGION_STRING_ERROR = 'Регион должен быть строкой'
export const ADDRESS_CITY_STRING_ERROR = 'Город должен быть строкой'
export const ADDRESS_STREET_STRING_ERROR = 'Улица должна быть строкой'
export const ADDRESS_ZIP_STRING_ERROR = 'Почтовый индекс должен быть строкой'
export const ADDRESS_BUILDING_NUMBER_STRING_ERROR =
  'Номер дома/квартиры должен быть строкой'

export const USER_ID_EXAMPLE = '65f1e8d3f9a2b56789c54321'
export const USER_EMAIL_EXAMPLE = 'john.swoosh@example.com'
export const USER_NAME_EXAMPLE = 'John Doe'
export const USER_PHONE_EXAMPLE = '+380991112233'
export const USER_EMAIL_VERIFIED_EXAMPLE = false
export const USER_ADDRESS_COMPANY_EXAMPLE = 'Swoosh'
export const USER_ADDRESS_REGION_EXAMPLE = 'Kyiv region'
export const USER_ADDRESS_CITY_EXAMPLE = 'Kyiv'
export const USER_ADDRESS_STREET_EXAMPLE = 'Khreshchatyk St'
export const USER_ADDRESS_ZIP_EXAMPLE = '01001'
export const USER_ADDRESS_BUILDING_NUMBER_EXAMPLE = '15A'
