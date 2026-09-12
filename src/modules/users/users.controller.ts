import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common'
import { Auth, CurrentUser } from '@modules/auth'
import type { UserWithoutPassword } from '@modules/auth'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'
import {
  UsersGetProfileDocs,
  UsersTagDocs,
  UsersUpdateProfileDocs,
} from './users.swagger'

@UsersTagDocs()
@Controller('/profile')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UsersGetProfileDocs()
  @Auth()
  @Get()
  getProfile(@CurrentUser() user: UserWithoutPassword) {
    return user
  }

  @UsersUpdateProfileDocs()
  @HttpCode(HttpStatus.OK)
  @Auth()
  @Put()
  async updateProfile(
    @CurrentUser() user: UserWithoutPassword,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user._id, dto)
  }
}
