import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  ContactRequest,
  ContactRequestSchema,
} from './models/contact-request.model'
import { ContactRequestController } from './contact-request.controller'
import { ContactRequestService } from './contact-request.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContactRequest.name,
        schema: ContactRequestSchema,
      },
    ]),
  ],
  controllers: [ContactRequestController],
  providers: [ContactRequestService],
})
export class ContactRequestModule {}
