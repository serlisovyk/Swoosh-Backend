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
  CONTACT_REQUEST_EMAIL_EMPTY_ERROR,
  CONTACT_REQUEST_EMAIL_FORMAT_ERROR,
  CONTACT_REQUEST_EMAIL_STRING_ERROR,
  CONTACT_REQUEST_MESSAGE_MAX_LENGTH_ERROR,
  CONTACT_REQUEST_MESSAGE_STRING_ERROR,
  CONTACT_REQUEST_NAME_EMPTY_ERROR,
  CONTACT_REQUEST_NAME_MAX_LENGTH_ERROR,
  CONTACT_REQUEST_NAME_STRING_ERROR,
} from '../contact-request.constants'
import {
  ContactRequestEmailPropertyDocs,
  ContactRequestMessagePropertyDocs,
  ContactRequestNamePropertyDocs,
} from '../contact-request.swagger'

export class CreateContactRequestDto {
  @ContactRequestNamePropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: CONTACT_REQUEST_NAME_STRING_ERROR })
  @IsNotEmpty({ message: CONTACT_REQUEST_NAME_EMPTY_ERROR })
  @MaxLength(100, { message: CONTACT_REQUEST_NAME_MAX_LENGTH_ERROR })
  name!: string

  @ContactRequestEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: CONTACT_REQUEST_EMAIL_STRING_ERROR })
  @IsNotEmpty({ message: CONTACT_REQUEST_EMAIL_EMPTY_ERROR })
  @IsEmail({}, { message: CONTACT_REQUEST_EMAIL_FORMAT_ERROR })
  email!: string

  @ContactRequestMessagePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: CONTACT_REQUEST_MESSAGE_STRING_ERROR })
  @MaxLength(1000, { message: CONTACT_REQUEST_MESSAGE_MAX_LENGTH_ERROR })
  message?: string
}
