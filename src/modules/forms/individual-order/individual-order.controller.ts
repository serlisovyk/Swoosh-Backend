import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ParseObjectIdPipe } from '@nestjs/mongoose'
import { Auth } from '@modules/auth/decorators/auth.decorator'
import { ROLES } from '@modules/user/user.types'
import { CreateIndividualOrderDto } from './dto/create-individual-order.dto'
import { FindAllIndividualOrdersDto } from './dto/find-all-individual-orders.dto'
import { UpdateIndividualOrderDto } from './dto/update-individual-order.dto'
import { IndividualOrderService } from './individual-order.service'
import {
  IndividualOrderCreateDocs,
  IndividualOrderDeleteDocs,
  IndividualOrderFindAllDocs,
  IndividualOrderFindByIdDocs,
  IndividualOrderTagDocs,
  IndividualOrderUpdateDocs,
} from './individual-order.swagger'

@IndividualOrderTagDocs()
@Controller('forms/individual-orders')
export class IndividualOrderController {
  constructor(
    private readonly individualOrderService: IndividualOrderService,
  ) {}

  @IndividualOrderCreateDocs()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateIndividualOrderDto) {
    return this.individualOrderService.create(dto)
  }

  @IndividualOrderFindAllDocs()
  @Auth(ROLES.ADMIN)
  @Get()
  findAll(@Query() dto: FindAllIndividualOrdersDto) {
    return this.individualOrderService.findAll(dto)
  }

  @IndividualOrderFindByIdDocs()
  @Auth(ROLES.ADMIN)
  @Get(':id')
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.individualOrderService.findById(id)
  }

  @IndividualOrderUpdateDocs()
  @Auth(ROLES.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateIndividualOrderDto,
  ) {
    return this.individualOrderService.update(id, dto)
  }

  @IndividualOrderDeleteDocs()
  @Auth(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.individualOrderService.remove(id)
  }
}
