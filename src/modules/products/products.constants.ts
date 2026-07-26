import { PRODUCT_SORT_OPTIONS } from './products.types'

export const PRODUCT_TITLE_STRING_ERROR = 'Название товара должно быть строкой'
export const PRODUCT_TITLE_EMPTY_ERROR = 'Название товара не должно быть пустым'
export const PRODUCT_PRICE_NUMBER_ERROR = 'Цена товара должна быть числом'
export const PRODUCT_PRICE_MIN_ERROR = 'Цена товара не может быть отрицательной'
export const PRODUCT_DESCRIPTION_STRING_ERROR =
  'Описание товара должно быть строкой'
export const PRODUCT_DESCRIPTION_EMPTY_ERROR =
  'Описание товара не должно быть пустым'
export const PRODUCT_IMAGES_ARRAY_ERROR =
  'Изображения товара должны быть массивом'
export const PRODUCT_IMAGES_MIN_SIZE_ERROR =
  'Нужно указать хотя бы одно изображение товара'
export const PRODUCT_IMAGES_ITEM_STRING_ERROR =
  'Каждое изображение товара должно быть строкой'
export const PRODUCT_IMAGES_ITEM_EMPTY_ERROR =
  'Изображение товара не должно быть пустым'
export const PRODUCT_IMAGES_UNIQUE_ERROR =
  'Изображения товара не должны повторяться'
export const PRODUCT_OLD_PRICE_NUMBER_ERROR =
  'Старая цена товара должна быть числом'
export const PRODUCT_OLD_PRICE_MIN_ERROR =
  'Старая цена товара не может быть отрицательной'
export const PRODUCT_SALE_CF_NUMBER_ERROR =
  'Коэффициент скидки должен быть числом'
export const PRODUCT_SALE_CF_MIN_ERROR =
  'Коэффициент скидки не может быть отрицательным'
export const PRODUCT_SIZES_ARRAY_ERROR = 'Размеры товара должны быть массивом'
export const PRODUCT_SIZES_MIN_SIZE_ERROR =
  'Нужно указать хотя бы один размер товара'
export const PRODUCT_SIZES_ITEM_NUMBER_ERROR =
  'Каждый размер товара должен быть числом'
export const PRODUCT_SIZES_UNIQUE_ERROR = 'Размеры товара не должны повторяться'
export const PRODUCT_MATERIAL_STRING_ERROR = 'Материал должен быть строкой'
export const PRODUCT_MATERIAL_EMPTY_ERROR = 'Материал не должен быть пустым'
export const PRODUCT_IS_HIT_BOOLEAN_ERROR =
  'Поле isHit должно быть булевым значением'
export const PRODUCT_IS_NEW_ARRIVAL_BOOLEAN_ERROR =
  'Поле isNewArrival должно быть булевым значением'
export const PRODUCT_COLORS_ARRAY_ERROR = 'Цвета товара должны быть массивом'
export const PRODUCT_COLORS_MIN_SIZE_ERROR =
  'Нужно указать хотя бы один цвет товара'
export const PRODUCT_CATEGORY_ID_ERROR =
  'Категория товара должна быть валидным id'
export const PRODUCT_CATEGORY_NAME_STRING_ERROR =
  'Название категории должно быть строкой'
export const PRODUCT_CATEGORY_NAME_EMPTY_ERROR =
  'Название категории не должно быть пустым'
export const PRODUCT_COLOR_NAME_STRING_ERROR =
  'Название цвета должно быть строкой'
export const PRODUCT_COLOR_NAME_EMPTY_ERROR =
  'Название цвета не должно быть пустым'
export const PRODUCT_COLOR_HEX_STRING_ERROR = 'HEX цвета должен быть строкой'
export const PRODUCT_COLOR_HEX_EMPTY_ERROR = 'HEX цвета не должен быть пустым'
export const PRODUCT_NOT_FOUND_ERROR = 'Товар не найден'
export const PRODUCT_CATEGORY_NOT_FOUND_ERROR = 'Категория товара не найдена'
export const PRODUCT_QUERY_SIZE_ARRAY_ERROR =
  'Фильтр размера должен быть массивом'
export const PRODUCT_QUERY_SIZE_NUMBER_ERROR =
  'Фильтр размера должен содержать числа'
export const PRODUCT_QUERY_COLOR_NAME_ARRAY_ERROR =
  'Фильтр цвета должен быть массивом'
export const PRODUCT_QUERY_COLOR_NAME_STRING_ERROR =
  'Фильтр цвета должен содержать строки'
export const PRODUCT_QUERY_CATEGORY_ARRAY_ERROR =
  'Фильтр категории должен быть массивом'
export const PRODUCT_QUERY_CATEGORY_FORMAT_ERROR =
  'Фильтр категории должен содержать валидные MongoDB ObjectId'
export const PRODUCT_QUERY_MATERIAL_ARRAY_ERROR =
  'Фильтр материала должен быть массивом'
export const PRODUCT_QUERY_MATERIAL_STRING_ERROR =
  'Фильтр материала должен содержать строки'
export const PRODUCT_QUERY_IS_HIT_BOOLEAN_ERROR =
  'Фильтр isHit должен быть булевым значением'
export const PRODUCT_QUERY_IS_NEW_ARRIVAL_BOOLEAN_ERROR =
  'Фильтр isNewArrival должен быть булевым значением'
export const PRODUCT_QUERY_HAS_DISCOUNT_BOOLEAN_ERROR =
  'Фильтр hasDiscount должен быть булевым значением'
export const PRODUCT_QUERY_SEARCH_STRING_ERROR =
  'Поисковый запрос должен быть строкой'
export const PRODUCT_QUERY_PRICE_ARRAY_ERROR =
  'Фильтр цены должен быть массивом'
export const PRODUCT_QUERY_PRICE_NUMBER_ERROR =
  'Фильтр цены должен содержать числа'
export const PRODUCT_QUERY_PRICE_MAX_SIZE_ERROR =
  'Фильтр цены может содержать не более двух значений'
export const PRODUCT_QUERY_LIMIT_NUMBER_ERROR = 'Лимит должен быть числом'
export const PRODUCT_QUERY_LIMIT_MIN_ERROR = 'Лимит должен быть не меньше 1'
export const PRODUCT_QUERY_LIMIT_MAX_ERROR = 'Лимит должен быть не больше 100'
export const PRODUCT_QUERY_SORT_ERROR = 'Некорректное значение сортировки'
export const PRODUCT_QUERY_IDS_ARRAY_ERROR =
  'Id товаров должно быть массивом и содержать валидные MongoDB ObjectId'
export const PRODUCT_QUERY_IDS_FORMAT_ERROR =
  'Каждый id товара должен быть валидным MongoDB ObjectId'
export const PRODUCT_IMAGES_ITEM_URL_ERROR =
  'Каждое изображение товара должно быть валидным URL'
export const PRODUCT_COLOR_HEX_FORMAT_ERROR =
  'HEX цвета должен быть валидным значением'
export const PRODUCT_OLD_PRICE_LOWER_THAN_PRICE_ERROR =
  'Старая цена должна быть больше или равна текущей цене'
export const PRODUCT_SALE_CF_REQUIRES_OLD_PRICE_ERROR =
  'Коэффициент скидки требует, чтобы старая цена была больше текущей цены'
export const PRODUCT_QUERY_PAGE_NUMBER_ERROR = 'Страница должна быть числом'
export const PRODUCT_QUERY_PAGE_MIN_ERROR = 'Страница должна быть не меньше 1'

export const DEFAULT_PRODUCTS_LIMIT = 18

export const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g

export const PRODUCT_SORT_MAP: Record<
  PRODUCT_SORT_OPTIONS,
  Record<string, 1 | -1>
> = {
  [PRODUCT_SORT_OPTIONS.NEWEST]: { createdAt: -1 },
  [PRODUCT_SORT_OPTIONS.OLDEST]: { createdAt: 1 },
  [PRODUCT_SORT_OPTIONS.PRICE_ASC]: { price: 1 },
  [PRODUCT_SORT_OPTIONS.PRICE_DESC]: { price: -1 },
}

export const updateProductOptions = {
  returnDocument: 'after' as const,
  runValidators: true,
}

export const PRODUCT_ID_EXAMPLE = '65f1e8d3f9a2b56789c12346'

export const PRODUCT_CATEGORY_ID_EXAMPLE = '65f1e8d3f9a2b56789c12345'

export const PRODUCT_IMAGE_EXAMPLES = [
  'https://image-example.com/products/air-max-pulse/front.webp',
  'https://image-example.com/products/air-max-pulse/side.webp',
]
