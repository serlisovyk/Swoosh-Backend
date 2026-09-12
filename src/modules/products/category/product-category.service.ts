import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MONGOOSE_UPDATE_AFTER_OPTIONS } from '@shared/constants'
import { ProductsService } from '../products.service'
import type { ProductCategoryModel } from '../products.types'
import { CreateProductCategoryDto } from './dto/create-product-category.dto'
import { UpdateProductCategoryDto } from './dto/update-product-category.dto'
import { ProductCategory } from './models/product-category.model'
import {
  PRODUCT_CATEGORY_ALREADY_IN_USE_ERROR,
  PRODUCT_CATEGORY_NAME_ALREADY_EXISTS_ERROR,
  PRODUCT_CATEGORY_NOT_FOUND_ERROR,
  PRODUCT_CATEGORY_SELECT_FIELDS,
} from './product-category.constants'

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectModel(ProductCategory.name)
    private readonly categoryModel: ProductCategoryModel,
    private readonly productsService: ProductsService,
  ) {}

  findAll() {
    return this.categoryModel
      .find()
      .sort({ name: 1 })
      .select(PRODUCT_CATEGORY_SELECT_FIELDS)
      .lean()
  }

  async create(dto: CreateProductCategoryDto) {
    try {
      const category = await this.categoryModel.create(dto)

      return this.findById(String(category._id))
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(PRODUCT_CATEGORY_NAME_ALREADY_EXISTS_ERROR)
      }

      throw error
    }
  }

  async update(id: string, dto: UpdateProductCategoryDto) {
    try {
      const category = await this.categoryModel
        .findByIdAndUpdate(id, dto, MONGOOSE_UPDATE_AFTER_OPTIONS)
        .select(PRODUCT_CATEGORY_SELECT_FIELDS)
        .lean()

      if (!category) {
        throw new NotFoundException(PRODUCT_CATEGORY_NOT_FOUND_ERROR)
      }

      return category
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error

      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(PRODUCT_CATEGORY_NAME_ALREADY_EXISTS_ERROR)
      }

      throw error
    }
  }

  async remove(id: string) {
    const isInUse = await this.productsService.existsWithCategory(id)

    if (isInUse) {
      throw new ConflictException(PRODUCT_CATEGORY_ALREADY_IN_USE_ERROR)
    }

    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .lean()

    if (!deletedCategory) {
      throw new NotFoundException(PRODUCT_CATEGORY_NOT_FOUND_ERROR)
    }

    return true
  }

  private async findById(id: string) {
    const category = await this.categoryModel
      .findById(id)
      .select(PRODUCT_CATEGORY_SELECT_FIELDS)
      .lean()

    if (!category) throw new NotFoundException(PRODUCT_CATEGORY_NOT_FOUND_ERROR)

    return category
  }

  private isDuplicateKeyError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    )
  }
}
