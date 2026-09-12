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
import { UserService } from './user.service'
import {
  UserGetProfileDocs,
  UserTagDocs,
  UserUpdateProfileDocs,
} from './user.swagger'

@UserTagDocs()
@Controller('/profile')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UserGetProfileDocs()
  @Auth()
  @Get()
  getProfile(@CurrentUser() user: UserWithoutPassword) {
    return user
  }

  @UserUpdateProfileDocs()
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
