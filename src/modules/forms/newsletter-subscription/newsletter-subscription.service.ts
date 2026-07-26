import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto'
import { FindAllNewsletterSubscriptionsDto } from './dto/find-all-newsletter-subscriptions.dto'
import { UpdateNewsletterSubscriptionDto } from './dto/update-newsletter-subscription.dto'
import { NewsletterSubscription } from './models/newsletter-subscription.model'
import {
  NEWSLETTER_SUBSCRIPTION_ALREADY_EXISTS_ERROR,
  NEWSLETTER_SUBSCRIPTION_NOT_FOUND_ERROR,
  updateNewsletterSubscriptionOptions,
} from './newsletter-subscription.constants'
import type {
  NewsletterSubscriptionListResponse,
  NewsletterSubscriptionModel,
} from './newsletter-subscription.types'
import { buildNewsletterSubscriptionListQueryOptions } from './newsletter-subscription.utils'

@Injectable()
export class NewsletterSubscriptionService {
  constructor(
    @InjectModel(NewsletterSubscription.name)
    private readonly newsletterSubscriptionModel: NewsletterSubscriptionModel,
  ) {}

  private readonly selectFields = '-__v'

  async create(dto: CreateNewsletterSubscriptionDto) {
    const isExisting = await this.newsletterSubscriptionModel.exists({
      email: dto.email,
    })

    if (isExisting) return true

    try {
      await this.newsletterSubscriptionModel.create(dto)
      return true
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) return true

      throw error
    }
  }

  async findAll(
    dto: FindAllNewsletterSubscriptionsDto,
  ): Promise<NewsletterSubscriptionListResponse> {
    const { filters, limit, skip, sort } =
      buildNewsletterSubscriptionListQueryOptions(dto)

    const data = this.newsletterSubscriptionModel
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(this.selectFields)
      .lean()

    const count = this.newsletterSubscriptionModel.countDocuments(filters)

    const [newsletterSubscriptions, total] = await Promise.all([data, count])

    return { newsletterSubscriptions, total }
  }

  async findById(id: string) {
    const newsletterSubscription = await this.newsletterSubscriptionModel
      .findById(id)
      .select(this.selectFields)
      .lean()

    if (!newsletterSubscription) {
      throw new NotFoundException(NEWSLETTER_SUBSCRIPTION_NOT_FOUND_ERROR)
    }

    return newsletterSubscription
  }

  async update(id: string, dto: UpdateNewsletterSubscriptionDto) {
    await this.ensureEmailIsAvailable(id, dto.email)

    try {
      const newsletterSubscription = await this.newsletterSubscriptionModel
        .findByIdAndUpdate(id, dto, updateNewsletterSubscriptionOptions)
        .select(this.selectFields)
        .lean()

      if (!newsletterSubscription) {
        throw new NotFoundException(NEWSLETTER_SUBSCRIPTION_NOT_FOUND_ERROR)
      }

      return newsletterSubscription
    } catch (error: unknown) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(
          NEWSLETTER_SUBSCRIPTION_ALREADY_EXISTS_ERROR,
        )
      }

      throw error
    }
  }

  async remove(id: string) {
    const deletedNewsletterSubscription = await this.newsletterSubscriptionModel
      .findByIdAndDelete(id)
      .lean()

    if (!deletedNewsletterSubscription) {
      throw new NotFoundException(NEWSLETTER_SUBSCRIPTION_NOT_FOUND_ERROR)
    }

    return true
  }

  private async ensureEmailIsAvailable(id: string, email: string) {
    const existingNewsletterSubscription = await this.newsletterSubscriptionModel
      .findOne({ email, _id: { $ne: id } })
      .select('_id')
      .lean()

    if (existingNewsletterSubscription) {
      throw new ConflictException(
        NEWSLETTER_SUBSCRIPTION_ALREADY_EXISTS_ERROR,
      )
    }
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
