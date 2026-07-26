import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ParseObjectIdPipe } from '@nestjs/mongoose'
import { Auth } from '@modules/auth/decorators/auth.decorator'
import { ROLES } from '@modules/user/user.types'
import { CreateNewsletterSubscriptionDto } from './dto/create-newsletter-subscription.dto'
import { FindAllNewsletterSubscriptionsDto } from './dto/find-all-newsletter-subscriptions.dto'
import { UpdateNewsletterSubscriptionDto } from './dto/update-newsletter-subscription.dto'
import { NewsletterSubscriptionService } from './newsletter-subscription.service'
import {
  NewsletterSubscriptionCreateDocs,
  NewsletterSubscriptionDeleteDocs,
  NewsletterSubscriptionFindAllDocs,
  NewsletterSubscriptionFindByIdDocs,
  NewsletterSubscriptionTagDocs,
  NewsletterSubscriptionUpdateDocs,
} from './newsletter-subscription.swagger'

@NewsletterSubscriptionTagDocs()
@Controller('forms/newsletter-subscriptions')
export class NewsletterSubscriptionController {
  constructor(
    private readonly newsletterSubscriptionService: NewsletterSubscriptionService,
  ) {}

  @NewsletterSubscriptionCreateDocs()
  @Post()
  create(@Body() dto: CreateNewsletterSubscriptionDto) {
    return this.newsletterSubscriptionService.create(dto)
  }

  @NewsletterSubscriptionFindAllDocs()
  @Auth(ROLES.ADMIN)
  @Get()
  findAll(@Query() dto: FindAllNewsletterSubscriptionsDto) {
    return this.newsletterSubscriptionService.findAll(dto)
  }

  @NewsletterSubscriptionFindByIdDocs()
  @Auth(ROLES.ADMIN)
  @Get(':id')
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.newsletterSubscriptionService.findById(id)
  }

  @NewsletterSubscriptionUpdateDocs()
  @Auth(ROLES.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateNewsletterSubscriptionDto,
  ) {
    return this.newsletterSubscriptionService.update(id, dto)
  }

  @NewsletterSubscriptionDeleteDocs()
  @Auth(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.newsletterSubscriptionService.remove(id)
  }
}
