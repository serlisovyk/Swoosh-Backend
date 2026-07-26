import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { buildContactRequestListQueryOptions } from './contact-request.utils'
import {
  CONTACT_REQUEST_NOT_FOUND_ERROR,
  updateContactRequestOptions,
} from './contact-request.constants'
import { CreateContactRequestDto } from './dto/create-contact-request.dto'
import { FindAllContactRequestsDto } from './dto/find-all-contact-requests.dto'
import { UpdateContactRequestDto } from './dto/update-contact-request.dto'
import { ContactRequest } from './models/contact-request.model'
import type {
  ContactRequestListResponse,
  ContactRequestModel,
} from './contact-request.types'

@Injectable()
export class ContactRequestService {
  constructor(
    @InjectModel(ContactRequest.name)
    private readonly contactRequestModel: ContactRequestModel,
  ) {}

  private readonly selectFields = '-__v'

  async create(dto: CreateContactRequestDto) {
    await this.contactRequestModel.create(dto)

    return true
  }

  async findAll(
    dto: FindAllContactRequestsDto,
  ): Promise<ContactRequestListResponse> {
    const { filters, limit, skip, sort } = buildContactRequestListQueryOptions(
      dto,
    )

    const data = this.contactRequestModel
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(this.selectFields)
      .lean()

    const count = this.contactRequestModel.countDocuments(filters)

    const [contactRequests, total] = await Promise.all([data, count])

    return { contactRequests, total }
  }

  async findById(id: string) {
    const contactRequest = await this.contactRequestModel
      .findById(id)
      .select(this.selectFields)
      .lean()

    if (!contactRequest) {
      throw new NotFoundException(CONTACT_REQUEST_NOT_FOUND_ERROR)
    }

    return contactRequest
  }

  async update(id: string, dto: UpdateContactRequestDto) {
    const contactRequest = await this.contactRequestModel
      .findByIdAndUpdate(id, dto, updateContactRequestOptions)
      .select(this.selectFields)
      .lean()

    if (!contactRequest) {
      throw new NotFoundException(CONTACT_REQUEST_NOT_FOUND_ERROR)
    }

    return contactRequest
  }

  async remove(id: string) {
    const deletedContactRequest = await this.contactRequestModel
      .findByIdAndDelete(id)
      .lean()

    if (!deletedContactRequest) {
      throw new NotFoundException(CONTACT_REQUEST_NOT_FOUND_ERROR)
    }

    return true
  }
}
