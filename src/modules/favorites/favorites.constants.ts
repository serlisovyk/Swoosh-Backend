export const FAVORITES_DEFAULT_LIMIT = 12
export const FAVORITES_MAX_LIMIT = 100
export const FAVORITES_MAX_PRODUCT_IDS = 100
export const FAVORITES_UPDATE_CONFLICT_ERROR =
  'Избранное было обновлено одновременно. Пожалуйста, повторите попытку.'

export const FAVORITES_PAGE_NUMBER_ERROR = 'Страница должна быть числом.'
export const FAVORITES_PAGE_MIN_ERROR = 'Страница должна быть больше 0.'
export const FAVORITES_LIMIT_NUMBER_ERROR = 'Лимит должен быть целым числом.'
export const FAVORITES_LIMIT_MIN_ERROR = 'Лимит должен быть больше 0.'
export const FAVORITES_LIMIT_MAX_ERROR = `Лимит не должен быть больше ${FAVORITES_MAX_LIMIT}.`

export const FAVORITES_PRODUCT_IDS_ARRAY_ERROR =
  'favoriteProductIds должен быть массивом.'
export const FAVORITES_PRODUCT_ID_FORMAT_ERROR =
  'Каждый идентификатор избранного продукта должен быть допустимым MongoDB ObjectId.'

export const FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR = `favoriteProductIds не должен содержать более ${FAVORITES_MAX_PRODUCT_IDS} элементов.`

export const FAVORITES_PRODUCT_ID_EXAMPLE = '65f1e8d3f9a2b56789c12345'
export const FAVORITES_PRODUCT_IDS_EXAMPLE = [
  '65f1e8d3f9a2b56789c12345',
  '65f1e8d3f9a2b56789c12346',
]
