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

export class UpdateUserDto {
  @UsersNamePropertyDocs()
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  name?: string

  @UsersEmailPropertyDocs()
  @IsOptional()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: 'Email должен быть строкой' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email?: string

  @UsersNewPasswordPropertyDocs()
  @IsOptional()
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @MinLength(6, {
    message: 'Новый пароль должен содержать минимум 6 символов',
  })
  newPassword?: string

  @UsersCurrentPasswordPropertyDocs()
  @IsOptional()
  @IsString({ message: 'Текущий пароль должен быть строкой' })
  currentPassword?: string

  @UsersPhonePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => normalizePhoneValue(value))
  @IsString({ message: 'Телефон должен быть строкой' })
  phone?: string

  @UsersAddressOptionalPropertyDocs(UpdateAddressDto)
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto
}
