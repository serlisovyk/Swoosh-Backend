import { ProductCategory } from './models/product-category.model'

export interface ProductCategoryListResponse {
  categories: ProductCategory[]
  total: number
}
