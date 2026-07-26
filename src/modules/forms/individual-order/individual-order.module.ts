import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  IndividualOrder,
  IndividualOrderSchema,
} from './models/individual-order.model'
import { IndividualOrderController } from './individual-order.controller'
import { IndividualOrderService } from './individual-order.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: IndividualOrder.name, schema: IndividualOrderSchema },
    ]),
  ],
  controllers: [IndividualOrderController],
  providers: [IndividualOrderService],
})
export class IndividualOrderModule {}
