import { Model } from 'mongoose'
import { ProductCategory } from './models/product-category.model'
import { Product } from './models/product.model'

export type ProductModel = Model<Product>
export type ProductCategoryModel = Model<ProductCategory>

export interface ProductListQueryOptions {
  filters: Record<string, unknown>
  ids?: string[]
  excludeIds?: string[]
  limit: number
  skip: number
  sort: Record<string, 1 | -1>
}

export interface ProductFiltersMetadata {
  sizes: number[]
  materials: string[]
  colors: string[]
  categories: ProductFiltersCategory[]
  priceRange: [number, number]
}

export interface ProductFiltersCategory {
  _id: string
  name: string
}

export interface ProductPricingState {
  oldPrice?: number | null
  price: number
  saleCF: number
}

export interface ProductPriceRangeStats {
  minPrice: number
  maxPrice: number
}

export const PRODUCT_SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRICE_ASC: 'priceAsc',
  PRICE_DESC: 'priceDesc',
} as const

export type PRODUCT_SORT_OPTIONS =
  (typeof PRODUCT_SORT_OPTIONS)[keyof typeof PRODUCT_SORT_OPTIONS]
