import { USER_STATUSES, ROLES, PROPERTY_TYPES, OWNERSHIP_TYPES, HEARD_ABOUT_SOURCES } from '../../../models/user.model';
import { TEAM_SIZE_BUCKETS } from '../../../models/contractor.model';
import {
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PROJECT_TYPES } from '@/models/project.model';

class UpdateAddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  zipcode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

class UpdateNotificationPreferencesDto {
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

class UpdatePropertyDto {
  @IsOptional()
  @IsEnum(PROPERTY_TYPES)
  type?: typeof PROPERTY_TYPES[number];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;

  @IsOptional()
  @IsEnum(OWNERSHIP_TYPES)
  ownershipType?: typeof OWNERSHIP_TYPES[number];

  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateHeardAboutDto {
  @IsOptional()
  @IsEnum(HEARD_ABOUT_SOURCES)
  source?: typeof HEARD_ABOUT_SOURCES[number];

  @IsOptional()
  @IsString()
  otherDetails?: string;
}

class UpdateInsuranceDto {
  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsString()
  coverageDetails?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;
}

class UpdateContractorDataDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsNumber()
  yearsInBusiness?: number;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  businessAddress?: UpdateAddressDto;

  @IsOptional()
  @IsArray()
  @IsEnum(PROJECT_TYPES, { each: true })
  services?: typeof PROJECT_TYPES[number][];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];

  @IsOptional()
  @IsEnum(TEAM_SIZE_BUCKETS)
  teamSize?: typeof TEAM_SIZE_BUCKETS[number];

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInsuranceDto)
  insurance?: UpdateInsuranceDto;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAddressDto)
  address?: UpdateAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationPreferencesDto)
  notificationPreferences?: UpdateNotificationPreferencesDto;

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
  @Type(() => UpdatePropertyDto)
  properties?: UpdatePropertyDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateHeardAboutDto)
  heardAboutRiskfeed?: UpdateHeardAboutDto;

  // Contractor fields
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContractorDataDto)
  contractorData?: UpdateContractorDataDto;
}

