import {
  ForbiddenException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common'
import { Auth } from '@modules/auth/decorators/auth.decorator'
import { CurrentUser } from '@modules/auth/decorators/user.decorator'
import type { UserWithoutPassword } from '@modules/auth/auth.types'
import { EMAIL_VERIFICATION_REQUIRED_ERROR } from '@modules/auth/auth.constants'
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
    if (!user.isEmailVerified) {
      throw new ForbiddenException(EMAIL_VERIFICATION_REQUIRED_ERROR)
    }

    return this.usersService.update(user._id, dto)
  }
}
