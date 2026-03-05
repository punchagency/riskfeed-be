import { USER_STATUSES, ROLES, PROPERTY_TYPES, OWNERSHIP_TYPES, HEARD_ABOUT_SOURCES } from '../../models/user.model';
import { CONTRACTOR_SERVICES, TEAM_SIZE_BUCKETS } from '../../models/contractor.model';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  zipcode: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;
}

class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingCommunications?: boolean;
}

class PropertyDto {
  @IsEnum(PROPERTY_TYPES)
  type: typeof PROPERTY_TYPES[number];

  @IsOptional()
  @IsString()
  name?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @IsEnum(OWNERSHIP_TYPES)
  ownershipType?: typeof OWNERSHIP_TYPES[number];

  @IsOptional()
  @IsString()
  notes?: string;
}

class HeardAboutDto {
  @IsEnum(HEARD_ABOUT_SOURCES)
  source: typeof HEARD_ABOUT_SOURCES[number];

  @IsOptional()
  @IsString()
  otherDetails?: string;
}

class InsuranceDto {
  @IsString()
  provider: string;

  @IsString()
  policyNumber: string;

  @IsOptional()
  @IsString()
  coverageDetails?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;
}

class ContractorDataDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsString()
  licenseNumber: string;

  @IsNumber()
  yearsInBusiness: number;

  @IsString()
  taxId: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsString()
  businessEmail: string;

  @IsString()
  businessPhone: string;

  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  businessAddress: AddressDto;

  @IsArray()
  @IsEnum(CONTRACTOR_SERVICES, { each: true })
  services: typeof CONTRACTOR_SERVICES[number][];

  @IsArray()
  @IsString({ each: true })
  serviceAreas: string[];

  @IsOptional()
  @IsEnum(TEAM_SIZE_BUCKETS)
  teamSize?: typeof TEAM_SIZE_BUCKETS[number];

  @IsOptional()
  @ValidateNested()
  @Type(() => InsuranceDto)
  insurance?: InsuranceDto;
}

export class RegisterUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationPreferencesDto)
  notificationPreferences?: NotificationPreferencesDto;

  @IsOptional()
  @IsEnum(ROLES)
  role?: (typeof ROLES)[number];

  @IsOptional()
  @IsEnum(USER_STATUSES)
  status?: (typeof USER_STATUSES)[number];

  // Homeowner fields
  @IsOptional()
  @IsEnum(OWNERSHIP_TYPES)
  ownershipType?: typeof OWNERSHIP_TYPES[number];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyDto)
  properties?: PropertyDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => HeardAboutDto)
  heardAboutRiskfeed?: HeardAboutDto;

  // Contractor fields
  @IsOptional()
  @ValidateNested()
  @Type(() => ContractorDataDto)
  contractorData?: ContractorDataDto;
}

