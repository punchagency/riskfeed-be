import { USER_STATUSES, ROLES, HEARD_ABOUT_SOURCES } from '../../../models/user.model';
import { TEAM_SIZE_BUCKETS, CORPORATION_TYPES } from '../../../models/contractor.model';
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
  Min,
  Max,
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

class UpdateLicenseDto {
  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  state?: string;
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
  companyLogo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLicenseDto)
  licenses?: UpdateLicenseDto[];

  @IsOptional()
  @IsEnum(CORPORATION_TYPES)
  corporationType?: typeof CORPORATION_TYPES[number];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1800)
  @Max(new Date().getFullYear())
  yearEstablished?: number;

  @IsOptional()
  @IsString()
  taxId?: string;

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAddressDto)
  businessAddresses?: UpdateAddressDto[];

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
