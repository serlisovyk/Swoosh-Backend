import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { normalizeEmailValue } from '@shared/utils'
import { NewsletterSubscriptionEmailPropertyDocs } from '../newsletter-subscription.swagger'

export class CreateNewsletterSubscriptionDto {
  @NewsletterSubscriptionEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: 'Email должен быть строкой' })
  @IsNotEmpty({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string
}
