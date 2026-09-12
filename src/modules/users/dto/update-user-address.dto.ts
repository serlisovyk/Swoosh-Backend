import { IsOptional, IsString } from 'class-validator'
import {
  UsersAddressBuildingNumberPropertyDocs,
  UsersAddressCityPropertyDocs,
  UsersAddressCompanyPropertyDocs,
  UsersAddressRegionPropertyDocs,
  UsersAddressStreetPropertyDocs,
  UsersAddressZipPropertyDocs,
} from '../users.swagger'

export class UpdateAddressDto {
  @UsersAddressCompanyPropertyDocs()
  @IsOptional()
  @IsString({ message: 'Компания должна быть строкой' })
  company?: string

  @UsersAddressRegionPropertyDocs()
  @IsOptional()
  @IsString({ message: 'Регион должен быть строкой' })
  region?: string

  @UsersAddressCityPropertyDocs()
  @IsOptional()
  @IsString({ message: 'Город должен быть строкой' })
  city?: string

  @UsersAddressStreetPropertyDocs()
  @IsOptional()
  @IsString({ message: 'Улица должна быть строкой' })
  street?: string

  @UsersAddressZipPropertyDocs()
  @IsOptional()
  @IsString({ message: 'Почтовый индекс должен быть строкой' })
  zip?: string

  @UsersAddressBuildingNumberPropertyDocs()
  @IsOptional()
  @IsString({ message: 'Номер дома/квартиры должен быть строкой' })
  buildingNumber?: string
}
