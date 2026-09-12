import { SortMap } from '@shared/types'
import { PRODUCT_SORT_OPTIONS } from './products.types'

export const PRODUCT_NOT_FOUND_ERROR = 'Товар не найден'
export const PRODUCT_OLD_PRICE_LOWER_THAN_PRICE_ERROR =
  'Старая цена должна быть больше или равна текущей цене'
export const PRODUCT_SALE_CF_REQUIRES_OLD_PRICE_ERROR =
  'Коэффициент скидки требует, чтобы старая цена была больше текущей цены'

export const DEFAULT_PRODUCTS_LIMIT = 18
export const MAX_PRODUCTS_LIMIT = 100

export const PRODUCT_QUERY_IDS_ARRAY_ERROR =
  'Id товаров должно быть массивом и содержать валидные MongoDB ObjectId'
export const PRODUCT_QUERY_IDS_FORMAT_ERROR =
  'Каждый id товара должен быть валидным MongoDB ObjectId'
export const PRODUCT_QUERY_LIMIT_MAX_ERROR = `Лимит должен быть не больше ${MAX_PRODUCTS_LIMIT}`

export const FILTERS_METADATA_CACHE_TTL_MS = 60_000

export const PRODUCT_SORT_MAP: Record<PRODUCT_SORT_OPTIONS, SortMap> = {
  [PRODUCT_SORT_OPTIONS.NEWEST]: { createdAt: -1 },
  [PRODUCT_SORT_OPTIONS.OLDEST]: { createdAt: 1 },
  [PRODUCT_SORT_OPTIONS.PRICE_ASC]: { price: 1 },
  [PRODUCT_SORT_OPTIONS.PRICE_DESC]: { price: -1 },
}

export const PRODUCT_ID_EXAMPLE = '65f1e8d3f9a2b56789c12346'

export const PRODUCT_CATEGORY_ID_EXAMPLE = '65f1e8d3f9a2b56789c12345'
