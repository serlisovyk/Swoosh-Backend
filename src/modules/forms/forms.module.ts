import { Module } from '@nestjs/common'
import { ContactRequestModule } from './contact-request/contact-request.module'
import { IndividualOrderModule } from './individual-order/individual-order.module'
import { NewsletterSubscriptionModule } from './newsletter-subscription/newsletter-subscription.module'

@Module({
  imports: [
    ContactRequestModule,
    IndividualOrderModule,
    NewsletterSubscriptionModule,
  ],
})
export class FormsModule {}
