export const PRODUCT_CATEGORY_NAME_STRING_ERROR =
  'Название категории должно быть строкой'
export const PRODUCT_CATEGORY_NAME_EMPTY_ERROR =
  'Название категории не должно быть пустым'
export const PRODUCT_CATEGORY_NOT_FOUND_ERROR = 'Категория товара не найдена'
export const PRODUCT_CATEGORY_NAME_ALREADY_EXISTS_ERROR =
  'Категория с таким названием уже существует'
export const PRODUCT_CATEGORY_ALREADY_IN_USE_ERROR =
  'Категория используется в товарах и не может быть удалена'

export const updateProductCategoryOptions = {
  returnDocument: 'after' as const,
  runValidators: true,
}
