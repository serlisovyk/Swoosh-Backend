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
import { ContactRequestService } from './contact-request.service'
import {
  ContactRequestCreateDocs,
  ContactRequestDeleteDocs,
  ContactRequestFindAllDocs,
  ContactRequestFindByIdDocs,
  ContactRequestTagDocs,
  ContactRequestUpdateDocs,
} from './contact-request.swagger'
import { CreateContactRequestDto } from './dto/create-contact-request.dto'
import { FindAllContactRequestsDto } from './dto/find-all-contact-requests.dto'
import { UpdateContactRequestDto } from './dto/update-contact-request.dto'

@ContactRequestTagDocs()
@Controller('forms/contact-requests')
export class ContactRequestController {
  constructor(private readonly contactRequestService: ContactRequestService) {}

  @ContactRequestCreateDocs()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() dto: CreateContactRequestDto) {
    return this.contactRequestService.create(dto)
  }

  @ContactRequestFindAllDocs()
  @Auth(ROLES.ADMIN)
  @Get()
  findAll(@Query() dto: FindAllContactRequestsDto) {
    return this.contactRequestService.findAll(dto)
  }

  @ContactRequestFindByIdDocs()
  @Auth(ROLES.ADMIN)
  @Get(':id')
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.contactRequestService.findById(id)
  }

  @ContactRequestUpdateDocs()
  @Auth(ROLES.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateContactRequestDto,
  ) {
    return this.contactRequestService.update(id, dto)
  }

  @ContactRequestDeleteDocs()
  @Auth(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.contactRequestService.remove(id)
  }
}
