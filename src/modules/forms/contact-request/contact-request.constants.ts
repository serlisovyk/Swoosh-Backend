import { CONTACT_REQUEST_SORT_OPTIONS } from './contact-request.types'

export const CONTACT_REQUEST_NAME_STRING_ERROR = 'Имя должно быть строкой'
export const CONTACT_REQUEST_NAME_EMPTY_ERROR = 'Имя обязательно'
export const CONTACT_REQUEST_NAME_MAX_LENGTH_ERROR =
  'Имя не должно быть длиннее 100 символов'
export const CONTACT_REQUEST_EMAIL_STRING_ERROR = 'Email должен быть строкой'
export const CONTACT_REQUEST_EMAIL_EMPTY_ERROR = 'Email обязателен'
export const CONTACT_REQUEST_EMAIL_FORMAT_ERROR =
  'Некорректный формат email'
export const CONTACT_REQUEST_MESSAGE_STRING_ERROR =
  'Текст вопроса должен быть строкой'
export const CONTACT_REQUEST_MESSAGE_MAX_LENGTH_ERROR =
  'Текст вопроса не должен быть длиннее 1000 символов'
export const CONTACT_REQUEST_SEARCH_STRING_ERROR =
  'Поисковая строка должна быть строкой'
export const CONTACT_REQUEST_PAGE_NUMBER_ERROR =
  'Страница должна быть числом'
export const CONTACT_REQUEST_PAGE_MIN_ERROR =
  'Страница должна быть не меньше 1'
export const CONTACT_REQUEST_LIMIT_NUMBER_ERROR = 'Лимит должен быть числом'
export const CONTACT_REQUEST_LIMIT_MIN_ERROR =
  'Лимит должен быть не меньше 1'
export const CONTACT_REQUEST_LIMIT_MAX_ERROR =
  'Лимит должен быть не больше 100'
export const CONTACT_REQUEST_SORT_ERROR =
  'Некорректное значение сортировки'
export const CONTACT_REQUEST_NOT_FOUND_ERROR =
  'Сообщение из формы контактов не найдено'

export const DEFAULT_CONTACT_REQUESTS_LIMIT = 20
export const MAX_CONTACT_REQUESTS_LIMIT = 100

export const CONTACT_REQUEST_SORT_MAP: Record<
  CONTACT_REQUEST_SORT_OPTIONS,
  Record<string, 1 | -1>
> = {
  [CONTACT_REQUEST_SORT_OPTIONS.NEWEST]: { createdAt: -1 },
  [CONTACT_REQUEST_SORT_OPTIONS.OLDEST]: { createdAt: 1 },
}

export const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g

export const updateContactRequestOptions = {
  returnDocument: 'after' as const,
  runValidators: true,
}

export const CONTACT_REQUEST_ID_EXAMPLE = '65f1e8d3f9a2b56789c12348'
