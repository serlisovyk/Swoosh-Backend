import { Product } from '@modules/products/models/product.model'

export interface FavoritesStateResponse {
  favoriteProductIds: string[]
  total: number
}

export interface FavoritesListResponse {
  products: Product[]
  total: number
}
