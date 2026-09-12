import { IsOptional, IsString } from 'class-validator'
import {
  UsersAddressBuildingNumberPropertyDocs,
  UsersAddressCityPropertyDocs,
  UsersAddressCompanyPropertyDocs,
  UsersAddressRegionPropertyDocs,
  UsersAddressStreetPropertyDocs,
  UsersAddressZipPropertyDocs,
} from '../users.swagger'
import {
  ADDRESS_COMPANY_STRING_ERROR,
  ADDRESS_REGION_STRING_ERROR,
  ADDRESS_CITY_STRING_ERROR,
  ADDRESS_STREET_STRING_ERROR,
  ADDRESS_ZIP_STRING_ERROR,
  ADDRESS_BUILDING_NUMBER_STRING_ERROR,
} from '../users.constants'

export class UpdateAddressDto {
  @UsersAddressCompanyPropertyDocs()
  @IsOptional()
  @IsString({ message: ADDRESS_COMPANY_STRING_ERROR })
  company?: string

  @UsersAddressRegionPropertyDocs()
  @IsOptional()
  @IsString({ message: ADDRESS_REGION_STRING_ERROR })
  region?: string

  @UsersAddressCityPropertyDocs()
  @IsOptional()
  @IsString({ message: ADDRESS_CITY_STRING_ERROR })
  city?: string

  @UsersAddressStreetPropertyDocs()
  @IsOptional()
  @IsString({ message: ADDRESS_STREET_STRING_ERROR })
  street?: string

  @UsersAddressZipPropertyDocs()
  @IsOptional()
  @IsString({ message: ADDRESS_ZIP_STRING_ERROR })
  zip?: string

  @UsersAddressBuildingNumberPropertyDocs()
  @IsOptional()
  @IsString({ message: ADDRESS_BUILDING_NUMBER_STRING_ERROR })
  buildingNumber?: string
}
