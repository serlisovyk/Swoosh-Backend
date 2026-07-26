import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { normalizeEmailValue } from '@shared/utils'
import { NewsletterSubscriptionEmailPropertyDocs } from '../newsletter-subscription.swagger'
import {
  NEWSLETTER_SUBSCRIPTION_EMAIL_EMPTY_ERROR,
  NEWSLETTER_SUBSCRIPTION_EMAIL_FORMAT_ERROR,
  NEWSLETTER_SUBSCRIPTION_EMAIL_STRING_ERROR,
} from '../newsletter-subscription.constants'

export class CreateNewsletterSubscriptionDto {
  @NewsletterSubscriptionEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: NEWSLETTER_SUBSCRIPTION_EMAIL_STRING_ERROR })
  @IsNotEmpty({ message: NEWSLETTER_SUBSCRIPTION_EMAIL_EMPTY_ERROR })
  @IsEmail({}, { message: NEWSLETTER_SUBSCRIPTION_EMAIL_FORMAT_ERROR })
  email!: string
}
