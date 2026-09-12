import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { IndividualOrder } from './models/individual-order.model'
import { CreateIndividualOrderDto } from './dto/create-individual-order.dto'
import { FindAllIndividualOrdersDto } from './dto/find-all-individual-orders.dto'
import { UpdateIndividualOrderDto } from './dto/update-individual-order.dto'
import { MONGOOSE_UPDATE_AFTER_OPTIONS } from '@shared/constants'
import { buildIndividualOrderListQueryOptions } from './individual-order.utils'
import { INDIVIDUAL_ORDER_NOT_FOUND_ERROR } from './individual-order.constants'
import type {
  IndividualOrderListResponse,
  IndividualOrderModel,
} from './individual-order.types'

@Injectable()
export class IndividualOrderService {
  constructor(
    @InjectModel(IndividualOrder.name)
    private readonly individualOrderModel: IndividualOrderModel,
  ) {}

  async findAll(
    dto: FindAllIndividualOrdersDto,
  ): Promise<IndividualOrderListResponse> {
    const { filters, limit, skip, sort } =
      buildIndividualOrderListQueryOptions(dto)

    const data = this.individualOrderModel
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean()

    const count = this.individualOrderModel.countDocuments(filters)

    const [individualOrders, total] = await Promise.all([data, count])

    return { individualOrders, total }
  }

  async findById(id: string) {
    const individualOrder = await this.individualOrderModel
      .findById(id)
      .select('-__v')
      .lean()

    if (!individualOrder) {
      throw new NotFoundException(INDIVIDUAL_ORDER_NOT_FOUND_ERROR)
    }

    return individualOrder
  }

  async create(dto: CreateIndividualOrderDto) {
    await this.individualOrderModel.create(dto)

    return true
  }

  async update(id: string, dto: UpdateIndividualOrderDto) {
    const individualOrder = await this.individualOrderModel
      .findByIdAndUpdate(id, dto, MONGOOSE_UPDATE_AFTER_OPTIONS)
      .select('-__v')
      .lean()

    if (!individualOrder) {
      throw new NotFoundException(INDIVIDUAL_ORDER_NOT_FOUND_ERROR)
    }

    return individualOrder
  }

  async remove(id: string) {
    const deletedIndividualOrder = await this.individualOrderModel
      .findByIdAndDelete(id)
      .lean()

    if (!deletedIndividualOrder) {
      throw new NotFoundException(INDIVIDUAL_ORDER_NOT_FOUND_ERROR)
    }

    return true
  }
}
