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
  UserAddressOptionalPropertyDocs,
  UserCurrentPasswordPropertyDocs,
  UserEmailPropertyDocs,
  UserNamePropertyDocs,
  UserNewPasswordPropertyDocs,
  UserPhonePropertyDocs,
} from '../user.swagger'
import {
  EMAIL_STRING_ERROR,
  EMAIL_FORMAT_ERROR,
  NEW_PASSWORD_STRING_ERROR,
  NEW_PASSWORD_LENGTH_ERROR,
  NAME_STRING_ERROR,
  PHONE_STRING_ERROR,
  CURRENT_PASSWORD_STRING_ERROR,
} from '../user.constants'

export class UpdateUserDto {
  @UserNamePropertyDocs()
  @IsOptional()
  @IsString({ message: NAME_STRING_ERROR })
  name?: string

  @UserEmailPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: EMAIL_STRING_ERROR })
  @IsEmail({}, { message: EMAIL_FORMAT_ERROR })
  email?: string

  @UserNewPasswordPropertyDocs()
  @IsOptional()
  @IsString({ message: NEW_PASSWORD_STRING_ERROR })
  @MinLength(6, { message: NEW_PASSWORD_LENGTH_ERROR })
  newPassword?: string

  @UserCurrentPasswordPropertyDocs()
  @IsOptional()
  @IsString({ message: CURRENT_PASSWORD_STRING_ERROR })
  currentPassword?: string

  @UserPhonePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => normalizePhoneValue(value))
  @IsString({ message: PHONE_STRING_ERROR })
  phone?: string

  @UserAddressOptionalPropertyDocs(UpdateAddressDto)
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto
}
