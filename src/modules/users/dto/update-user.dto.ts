import { Transform, Type } from 'class-transformer'
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { normalizeEmailValue, normalizePhoneValue } from '@shared/utils'
import { UpdateAddressDto } from './update-user-address.dto'
import {
  UsersAddressOptionalPropertyDocs,
  UsersCurrentPasswordPropertyDocs,
  UsersEmailPropertyDocs,
  UsersNamePropertyDocs,
  UsersNewPasswordPropertyDocs,
  UsersPhonePropertyDocs,
} from '../users.swagger'
import {
  EMAIL_STRING_ERROR,
  EMAIL_FORMAT_ERROR,
  NEW_PASSWORD_STRING_ERROR,
  NEW_PASSWORD_LENGTH_ERROR,
  NAME_STRING_ERROR,
  PHONE_STRING_ERROR,
  CURRENT_PASSWORD_STRING_ERROR,
} from '../users.constants'

export class UpdateUserDto {
  @UsersNamePropertyDocs()
  @IsOptional()
  @IsString({ message: NAME_STRING_ERROR })
  name?: string

  @UsersEmailPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: EMAIL_STRING_ERROR })
  @IsEmail({}, { message: EMAIL_FORMAT_ERROR })
  email?: string

  @UsersNewPasswordPropertyDocs()
  @IsOptional()
  @IsString({ message: NEW_PASSWORD_STRING_ERROR })
  @MinLength(6, { message: NEW_PASSWORD_LENGTH_ERROR })
  newPassword?: string

  @UsersCurrentPasswordPropertyDocs()
  @IsOptional()
  @IsString({ message: CURRENT_PASSWORD_STRING_ERROR })
  currentPassword?: string

  @UsersPhonePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => normalizePhoneValue(value))
  @IsString({ message: PHONE_STRING_ERROR })
  phone?: string

  @UsersAddressOptionalPropertyDocs(UpdateAddressDto)
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto
}
