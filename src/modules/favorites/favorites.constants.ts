export const FAVORITES_DEFAULT_LIMIT = 12
export const FAVORITES_MAX_LIMIT = 100
export const FAVORITES_MAX_PRODUCT_IDS = 100

export const FAVORITES_PRODUCT_IDS_ARRAY_ERROR =
  'favoriteProductIds должен быть массивом.'
export const FAVORITES_PRODUCT_ID_FORMAT_ERROR =
  'Каждый идентификатор избранного продукта должен быть допустимым MongoDB ObjectId.'

export const FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR = `favoriteProductIds не должен содержать более ${FAVORITES_MAX_PRODUCT_IDS} элементов.`
