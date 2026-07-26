import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Product } from '@modules/products/models/product.model'
import { PRODUCT_NOT_FOUND_ERROR } from '@modules/products/products.constants'
import { User } from '@modules/user/models/user.model'
import { USER_NOT_FOUND_ERROR } from '@modules/user/user.constants'
import type { ProductModel } from '@modules/products/products.types'
import type { UserModel } from '@modules/user/user.types'
import { FindAllFavoritesDto } from './dto/find-all-favorites.dto'
import {
  areFavoriteProductIdsEqual,
  deduplicateFavoriteProductIds,
  normalizeFavoriteProductIds,
  orderProductsByIds,
  paginateFavoriteProductIds,
} from './favorites.utils'
import {
  FAVORITES_DEFAULT_LIMIT,
  FAVORITES_MAX_PRODUCT_IDS,
  FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR,
  FAVORITES_UPDATE_CONFLICT_ERROR,
} from './favorites.constants'
import {
  FavoritesListResponse,
  FavoritesStateResponse,
} from './favorites.types'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(User.name) private readonly userModel: UserModel,
    @InjectModel(Product.name) private readonly productModel: ProductModel,
  ) {}

  private readonly productSelectFields = '-__v'
  private readonly categorySelectFields = '-__v'

  async findAll(
    userId: string,
    dto: FindAllFavoritesDto,
  ): Promise<FavoritesListResponse> {
    const page = dto.page ?? 1
    const limit = dto.limit ?? FAVORITES_DEFAULT_LIMIT

    const favoriteProductIds = await this.getVisibleFavoriteProductIds(userId)
    const total = favoriteProductIds.length

    const pageFavoriteProductIds = paginateFavoriteProductIds(
      favoriteProductIds,
      page,
      limit,
    )

    if (!pageFavoriteProductIds.length) return { products: [], total }

    const products = await this.productModel
      .find({ _id: { $in: pageFavoriteProductIds } })
      .select(this.productSelectFields)
      .populate('category', this.categorySelectFields)
      .lean()

    return {
      products: orderProductsByIds(pageFavoriteProductIds, products),
      total,
    }
  }

  async add(
    userId: string,
    productId: string,
  ): Promise<FavoritesStateResponse> {
    const normalizedProductId = String(productId)

    await this.ensureProductExists(normalizedProductId)

    const favoriteProductIds = await this.updateFavoriteProductIds(
      userId,
      (currentFavoriteProductIds) => {
        const boundedFavoriteProductIds = currentFavoriteProductIds.slice(
          0,
          FAVORITES_MAX_PRODUCT_IDS,
        )

        if (boundedFavoriteProductIds.includes(normalizedProductId)) {
          return boundedFavoriteProductIds
        }

        if (boundedFavoriteProductIds.length >= FAVORITES_MAX_PRODUCT_IDS) {
          throw new BadRequestException(FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR)
        }

        return [...boundedFavoriteProductIds, normalizedProductId]
      },
    )

    return this.toStateResponse(favoriteProductIds)
  }

  async remove(
    userId: string,
    productId: string,
  ): Promise<FavoritesStateResponse> {
    const normalizedProductId = String(productId)

    const favoriteProductIds = await this.updateFavoriteProductIds(
      userId,
      (currentFavoriteProductIds) =>
        currentFavoriteProductIds.filter(
          (currentProductId) => currentProductId !== normalizedProductId,
        ),
    )

    return this.toStateResponse(favoriteProductIds)
  }

  async mergeFavoriteProductIds(
    userId: string,
    incomingProductIds: string[] = [],
  ): Promise<string[]> {
    const filteredIncomingProductIds =
      await this.filterExistingFavoriteProductIds(incomingProductIds)

    if (!filteredIncomingProductIds.length) {
      return this.getVisibleFavoriteProductIds(userId)
    }

    return this.updateFavoriteProductIds(userId, (currentFavoriteProductIds) =>
      deduplicateFavoriteProductIds([
        ...currentFavoriteProductIds,
        ...filteredIncomingProductIds,
      ]).slice(0, FAVORITES_MAX_PRODUCT_IDS),
    )
  }

  private async getVisibleFavoriteProductIds(userId: string) {
    const currentFavoriteProductIds =
      await this.findUserFavoriteProductIdsOrThrow(userId)

    const favoriteProductIds = await this.filterExistingFavoriteProductIds(
      currentFavoriteProductIds,
    )

    return favoriteProductIds.slice(0, FAVORITES_MAX_PRODUCT_IDS)
  }

  private async findUserFavoriteProductIdsOrThrow(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteProductIds')
      .lean()

    if (!user) throw new NotFoundException(USER_NOT_FOUND_ERROR)

    return deduplicateFavoriteProductIds(
      normalizeFavoriteProductIds(user.favoriteProductIds),
    )
  }

  private async filterExistingFavoriteProductIds(productIds: string[]) {
    const normalizedProductIds = deduplicateFavoriteProductIds(productIds)

    if (!normalizedProductIds.length) return []

    const existingProducts = await this.productModel
      .find({ _id: { $in: normalizedProductIds } })
      .select('_id')
      .lean()

    const existingProductIds = new Set(
      existingProducts.map((product) => String(product._id)),
    )

    return normalizedProductIds.filter((productId) =>
      existingProductIds.has(productId),
    )
  }

  private async ensureProductExists(productId: string) {
    const isExisting = await this.productModel.exists({ _id: productId })

    if (!isExisting) throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
  }

  private async updateFavoriteProductIds(
    userId: string,
    updater: (favoriteProductIds: string[]) => string[] | Promise<string[]>,
  ) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { favoriteProductIds, version } =
        await this.findUserFavoriteStateOrThrow(userId)

      const visibleFavoriteProductIds = await this.filterExistingFavoriteProductIds(
        favoriteProductIds,
      )

      const nextFavoriteProductIds = deduplicateFavoriteProductIds(
        normalizeFavoriteProductIds(
          await updater(
            visibleFavoriteProductIds.slice(0, FAVORITES_MAX_PRODUCT_IDS),
          ),
        ),
      ).slice(0, FAVORITES_MAX_PRODUCT_IDS)

      if (areFavoriteProductIdsEqual(nextFavoriteProductIds, favoriteProductIds)) {
        return nextFavoriteProductIds
      }

      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: userId, __v: version },
          {
            $set: { favoriteProductIds: nextFavoriteProductIds },
            $inc: { __v: 1 },
          },
          { returnDocument: 'after' },
        )
        .select('favoriteProductIds')
        .lean()

      if (updatedUser) {
        return deduplicateFavoriteProductIds(
          normalizeFavoriteProductIds(updatedUser.favoriteProductIds),
        )
      }
    }

    throw new ConflictException(FAVORITES_UPDATE_CONFLICT_ERROR)
  }

  private async findUserFavoriteStateOrThrow(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteProductIds __v')
      .lean()

    if (!user) throw new NotFoundException(USER_NOT_FOUND_ERROR)

    return {
      favoriteProductIds: deduplicateFavoriteProductIds(
        normalizeFavoriteProductIds(user.favoriteProductIds),
      ),
      version: user.__v ?? 0,
    }
  }

  private toStateResponse(
    favoriteProductIds: string[],
  ): FavoritesStateResponse {
    return {
      favoriteProductIds,
      total: favoriteProductIds.length,
    }
  }
}
