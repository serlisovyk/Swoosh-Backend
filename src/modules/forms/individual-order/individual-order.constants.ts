import { INDIVIDUAL_ORDER_SORT_OPTIONS } from './individual-order.types'

export const INDIVIDUAL_ORDER_NAME_STRING_ERROR =
  'Имя должно быть строкой'
export const INDIVIDUAL_ORDER_NAME_EMPTY_ERROR = 'Имя обязательно'
export const INDIVIDUAL_ORDER_NAME_MAX_LENGTH_ERROR =
  'Имя не должно быть длиннее 100 символов'
export const INDIVIDUAL_ORDER_PHONE_STRING_ERROR =
  'Телефон должен быть строкой'
export const INDIVIDUAL_ORDER_PHONE_EMPTY_ERROR = 'Телефон обязателен'
export const INDIVIDUAL_ORDER_PHONE_FORMAT_ERROR =
  'Телефон должен содержать от 10 до 15 цифр и может начинаться с +'
export const INDIVIDUAL_ORDER_EMAIL_STRING_ERROR =
  'Email должен быть строкой'
export const INDIVIDUAL_ORDER_EMAIL_EMPTY_ERROR = 'Email обязателен'
export const INDIVIDUAL_ORDER_EMAIL_FORMAT_ERROR =
  'Некорректный формат email'
export const INDIVIDUAL_ORDER_MESSAGE_STRING_ERROR =
  'Сообщение должно быть строкой'
export const INDIVIDUAL_ORDER_MESSAGE_MAX_LENGTH_ERROR =
  'Сообщение не должно быть длиннее 1000 символов'
export const INDIVIDUAL_ORDER_STATUS_ERROR =
  'Некорректное значение статуса'
export const INDIVIDUAL_ORDER_SEARCH_STRING_ERROR =
  'Поисковая строка должна быть строкой'
export const INDIVIDUAL_ORDER_PAGE_NUMBER_ERROR = 'Страница должна быть числом'
export const INDIVIDUAL_ORDER_PAGE_MIN_ERROR =
  'Страница должна быть не меньше 1'
export const INDIVIDUAL_ORDER_LIMIT_NUMBER_ERROR = 'Лимит должен быть числом'
export const INDIVIDUAL_ORDER_LIMIT_MIN_ERROR =
  'Лимит должен быть не меньше 1'
export const INDIVIDUAL_ORDER_LIMIT_MAX_ERROR =
  'Лимит должен быть не больше 100'
export const INDIVIDUAL_ORDER_SORT_ERROR =
  'Некорректное значение сортировки'
export const INDIVIDUAL_ORDER_NOT_FOUND_ERROR =
  'Индивидуальный заказ не найден'

export const DEFAULT_INDIVIDUAL_ORDERS_LIMIT = 20
export const MAX_INDIVIDUAL_ORDERS_LIMIT = 100

export const INDIVIDUAL_ORDER_SORT_MAP: Record<
  INDIVIDUAL_ORDER_SORT_OPTIONS,
  Record<string, 1 | -1>
> = {
  [INDIVIDUAL_ORDER_SORT_OPTIONS.NEWEST]: { createdAt: -1 },
  [INDIVIDUAL_ORDER_SORT_OPTIONS.OLDEST]: { createdAt: 1 },
}

export const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g

export const updateIndividualOrderOptions = {
  returnDocument: 'after' as const,
  runValidators: true,
}

export const INDIVIDUAL_ORDER_ID_EXAMPLE = '65f1e8d3f9a2b56789c12346'
