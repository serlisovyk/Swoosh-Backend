import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PRODUCT_NOT_FOUND_ERROR, ProductsService } from '@modules/products'
import { USER_NOT_FOUND_ERROR, UsersService } from '@modules/users'
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
} from './favorites.constants'
import {
  FavoritesListResponse,
  FavoritesStateResponse,
} from './favorites.types'

@Injectable()
export class FavoritesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(
    userId: string,
    dto: FindAllFavoritesDto,
  ): Promise<FavoritesListResponse> {
    const limit = dto.limit ?? FAVORITES_DEFAULT_LIMIT

    const favoriteProductIds = await this.getVisibleFavoriteProductIds(userId)
    const total = favoriteProductIds.length

    const pageFavoriteProductIds = paginateFavoriteProductIds(
      favoriteProductIds,
      dto.page,
      limit,
    )

    if (!pageFavoriteProductIds.length) return { products: [], total }

    const products = await this.productsService.findManyByIds(
      pageFavoriteProductIds,
    )

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
    const userFavoriteState =
      await this.usersService.getFavoriteProductIdsWithVersion(userId)

    if (!userFavoriteState) throw new NotFoundException(USER_NOT_FOUND_ERROR)

    return deduplicateFavoriteProductIds(
      normalizeFavoriteProductIds(userFavoriteState.favoriteProductIds),
    )
  }

  private async filterExistingFavoriteProductIds(productIds: string[]) {
    const normalizedProductIds = deduplicateFavoriteProductIds(productIds)

    if (!normalizedProductIds.length) return []

    return this.productsService.filterExistingIds(normalizedProductIds)
  }

  private async ensureProductExists(productId: string) {
    const isExisting = await this.productsService.existsById(productId)

    if (!isExisting) throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
  }

  private async updateFavoriteProductIds(
    userId: string,
    updater: (favoriteProductIds: string[]) => string[] | Promise<string[]>,
  ) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { favoriteProductIds, version } =
        await this.findUserFavoriteStateOrThrow(userId)

      const visibleFavoriteProductIds =
        await this.filterExistingFavoriteProductIds(favoriteProductIds)

      const nextFavoriteProductIds = deduplicateFavoriteProductIds(
        normalizeFavoriteProductIds(
          await updater(
            visibleFavoriteProductIds.slice(0, FAVORITES_MAX_PRODUCT_IDS),
          ),
        ),
      ).slice(0, FAVORITES_MAX_PRODUCT_IDS)

      if (
        areFavoriteProductIdsEqual(nextFavoriteProductIds, favoriteProductIds)
      ) {
        return nextFavoriteProductIds
      }

      const updatedFavoriteProductIds =
        await this.usersService.updateFavoriteProductIdsIfVersionMatches(
          userId,
          version,
          nextFavoriteProductIds,
        )

      if (updatedFavoriteProductIds) {
        return deduplicateFavoriteProductIds(
          normalizeFavoriteProductIds(updatedFavoriteProductIds),
        )
      }
    }

    throw new ConflictException(
      'Избранное было обновлено одновременно. Пожалуйста, повторите попытку.',
    )
  }

  private async findUserFavoriteStateOrThrow(userId: string) {
    const userFavoriteState =
      await this.usersService.getFavoriteProductIdsWithVersion(userId)

    if (!userFavoriteState) throw new NotFoundException(USER_NOT_FOUND_ERROR)

    return {
      favoriteProductIds: deduplicateFavoriteProductIds(
        normalizeFavoriteProductIds(userFavoriteState.favoriteProductIds),
      ),
      version: userFavoriteState.version,
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
