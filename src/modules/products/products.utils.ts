import {
  createContainsRegex,
  createExactRegex,
  resolvePaginationOffset,
} from '@shared/utils'
import { FindAllProductsDto } from './dto/find-all-products.dto'
import { DEFAULT_PRODUCTS_LIMIT, PRODUCT_SORT_MAP } from './products.constants'
import {
  type ProductListQueryOptions,
  PRODUCT_SORT_OPTIONS,
} from './products.types'

export function buildProductListQueryOptions(
  dto: FindAllProductsDto,
): ProductListQueryOptions {
  const {
    ids,
    excludeIds,
    size,
    price,
    colorName,
    category,
    material,
    isHit,
    isNewArrival,
    hasDiscount,
    search,
    sort,
    limit,
    page,
  } = dto

  const filters: Record<string, unknown> = {}

  if (price?.length) {
    if (price.length === 1) {
      filters.price = price[0]
    } else {
      const [minPrice, maxPrice] = [...price].sort((a, b) => a - b)

      filters.price = {
        $gte: minPrice,
        $lte: maxPrice,
      }
    }
  }

  if (size?.length) {
    filters.sizes = { $in: size }
  }

  if (colorName?.length) {
    filters['colors.name'] = {
      $in: colorName.map((value) => createExactRegex(value)),
    }
  }

  if (material?.length) {
    filters.material = {
      $in: material.map((value) => createExactRegex(value)),
    }
  }

  if (category?.length) {
    filters.category = { $in: category }
  }

  if (isHit !== undefined) {
    filters.isHit = isHit
  }

  if (isNewArrival !== undefined) {
    filters.isNewArrival = isNewArrival
  }

  if (hasDiscount !== undefined) {
    filters.saleCF = hasDiscount ? { $gt: 0 } : { $lte: 0 }
  }

  if (search) {
    const regex = createContainsRegex(search)

    filters.$or = [{ title: regex }, { description: regex }]
  }

  const sortOption = sort
    ? PRODUCT_SORT_MAP[sort]
    : PRODUCT_SORT_MAP[PRODUCT_SORT_OPTIONS.NEWEST]

  const limitOption = limit ?? DEFAULT_PRODUCTS_LIMIT

  const skip = resolvePaginationOffset(page, limitOption)

  return {
    filters,
    ids,
    excludeIds,
    sort: sortOption,
    limit: limitOption,
    skip,
  }
}
