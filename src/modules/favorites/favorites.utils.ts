import { isValidObjectId } from 'mongoose'
import { Product } from '@modules/products/models/product.model'

export function paginateFavoriteProductIds(
  favoriteProductIds: string[],
  page: number,
  limit: number,
) {
  const offset = (page - 1) * limit

  return favoriteProductIds.slice(offset, offset + limit)
}

export function orderProductsByIds(
  productIds: string[],
  products: Product[],
): Product[] {
  const productsMap = new Map(
    products.map((product) => [String(product._id), product]),
  )

  return productIds.flatMap((productId) => {
    const product = productsMap.get(productId)
    return product ? [product] : []
  })
}

export function normalizeFavoriteProductIds(productIds: unknown): string[] {
  if (!Array.isArray(productIds)) return []

  return productIds
    .map((productId) => String(productId))
    .filter((productId) => productId && isValidObjectId(productId))
}

export function deduplicateFavoriteProductIds(productIds: string[]) {
  return [...new Set(productIds)]
}

export function areFavoriteProductIdsEqual(
  leftProductIds: string[],
  rightProductIds: string[],
) {
  return (
    leftProductIds.length === rightProductIds.length &&
    leftProductIds.every(
      (productId, index) => productId === rightProductIds[index],
    )
  )
}
