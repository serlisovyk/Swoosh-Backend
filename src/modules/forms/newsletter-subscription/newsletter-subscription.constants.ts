import { NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS } from './newsletter-subscription.types'

export const NEWSLETTER_SUBSCRIPTION_EMAIL_STRING_ERROR =
  'Email должен быть строкой'
export const NEWSLETTER_SUBSCRIPTION_EMAIL_EMPTY_ERROR = 'Email обязателен'
export const NEWSLETTER_SUBSCRIPTION_EMAIL_FORMAT_ERROR =
  'Некорректный формат email'
export const NEWSLETTER_SUBSCRIPTION_SEARCH_STRING_ERROR =
  'Поисковая строка должна быть строкой'
export const NEWSLETTER_SUBSCRIPTION_PAGE_NUMBER_ERROR =
  'Страница должна быть числом'
export const NEWSLETTER_SUBSCRIPTION_PAGE_MIN_ERROR =
  'Страница должна быть не меньше 1'
export const NEWSLETTER_SUBSCRIPTION_LIMIT_NUMBER_ERROR =
  'Лимит должен быть числом'
export const NEWSLETTER_SUBSCRIPTION_LIMIT_MIN_ERROR =
  'Лимит должен быть не меньше 1'
export const NEWSLETTER_SUBSCRIPTION_LIMIT_MAX_ERROR =
  'Лимит должен быть не больше 100'
export const NEWSLETTER_SUBSCRIPTION_SORT_ERROR =
  'Некорректное значение сортировки'
export const NEWSLETTER_SUBSCRIPTION_ALREADY_EXISTS_ERROR =
  'Такой email уже подписан на рассылку'
export const NEWSLETTER_SUBSCRIPTION_NOT_FOUND_ERROR =
  'Подписка на рассылку не найдена'

export const DEFAULT_NEWSLETTER_SUBSCRIPTIONS_LIMIT = 20
export const MAX_NEWSLETTER_SUBSCRIPTIONS_LIMIT = 100

export const NEWSLETTER_SUBSCRIPTION_SORT_MAP: Record<
  NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS,
  Record<string, 1 | -1>
> = {
  [NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS.NEWEST]: { createdAt: -1 },
  [NEWSLETTER_SUBSCRIPTION_SORT_OPTIONS.OLDEST]: { createdAt: 1 },
}

export const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g

export const updateNewsletterSubscriptionOptions = {
  returnDocument: 'after' as const,
  runValidators: true,
}

export const NEWSLETTER_SUBSCRIPTION_ID_EXAMPLE =
  '65f1e8d3f9a2b56789c12347'
