import { Transform } from 'class-transformer'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { normalizeEmailValue, trimStringValue } from '@shared/utils'
import {
  ContactRequestEmailPropertyDocs,
  ContactRequestMessagePropertyDocs,
  ContactRequestNamePropertyDocs,
} from '../contact-request.swagger'

export class CreateContactRequestDto {
  @ContactRequestNamePropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MaxLength(100, { message: 'Имя не должно быть длиннее 100 символов' })
  name!: string

  @ContactRequestEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: 'Email должен быть строкой' })
  @IsNotEmpty({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string

  @ContactRequestMessagePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Текст вопроса должен быть строкой' })
  @MaxLength(1000, {
    message: 'Текст вопроса не должен быть длиннее 1000 символов',
  })
  message?: string
}
