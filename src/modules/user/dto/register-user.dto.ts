import { USER_STATUSES, ROLES, HEARD_ABOUT_SOURCES, ACCOUNT_ROLES } from '../../../models/user.model';
import { TEAM_SIZE_BUCKETS, CORPORATION_TYPES } from '../../../models/contractor.model';
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
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PROJECT_TYPES } from '@/models/project.model';

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

class LicenseDto {
  @IsString()
  number: string;

  @IsString()
  description: string;

  @IsString()
  state: string;
}

class ContractorDataDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  companyLogo?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LicenseDto)
  @ArrayMinSize(1)
  licenses: LicenseDto[];

  @IsEnum(CORPORATION_TYPES)
  corporationType: typeof CORPORATION_TYPES[number];

  @IsNumber()
  @Type(() => Number)
  @Min(1800)
  @Max(new Date().getFullYear())
  yearEstablished: number;

  @IsString()
  taxId: string;

  @IsString()
  businessEmail: string;

  @IsString()
  businessPhone: string;

  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  @ArrayMinSize(1)
  businessAddresses: AddressDto[];

  @IsArray()
  @IsEnum(PROJECT_TYPES, { each: true })
  services: typeof PROJECT_TYPES[number][];

  @IsArray()
  @Transform(({ value }) => value.split(",").map((item: string) => item.trim()))
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

  @IsOptional()
  @ValidateNested()
  @Type(() => HeardAboutDto)
  heardAboutRiskfeed?: HeardAboutDto;

  // Contractor fields
  @IsOptional()
  @ValidateNested()
  @Type(() => ContractorDataDto)
  contractorData?: ContractorDataDto;

  // Linked account fields
  @IsOptional()
  @IsString()
  parentAccount?: string;

  @IsOptional()
  @IsEnum(ACCOUNT_ROLES)
  accountRole?: typeof ACCOUNT_ROLES[number];
}
