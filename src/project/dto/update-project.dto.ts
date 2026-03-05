import { IsString, IsNumber, IsOptional, ValidateNested, IsEnum, IsDateString, IsArray, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { PROJECT_STATUSES, PROJECT_MILESTONES_STATUSES, PROJECT_RISK_LEVELS } from '@/models/project.model';

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

class PropertyDto {
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    name?: string;

    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;

    @IsOptional()
    @IsString()
    ownershipType?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    sizeSqFt?: number;

    @IsOptional()
    @IsString()
    ownerName?: string;
}

class MilestoneDto {
    @IsString()
    name: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    percentage: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    amount: number;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    sequence: number;

    @IsOptional()
    @IsEnum(PROJECT_MILESTONES_STATUSES)
    status?: typeof PROJECT_MILESTONES_STATUSES[number];
}

class DurationRangeDto {
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    minDays: number;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maxDays: number;
}

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    'property.type'?: string;

    @IsOptional()
    @IsString()
    'property.name'?: string;

    @IsOptional()
    @IsString()
    'property.address.street'?: string;

    @IsOptional()
    @IsString()
    'property.address.city'?: string;

    @IsOptional()
    @IsString()
    'property.address.state'?: string;

    @IsOptional()
    @IsString()
    'property.address.zipcode'?: string;

    @IsOptional()
    @IsString()
    'property.address.country'?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => PropertyDto)
    @Transform(({ value, obj }) => {
        // 1. Check for flat keys (multipart/form-data with dot notation)
        if (obj['property.type'] !== undefined || obj['property.address.street'] !== undefined) {
            return {
                type: obj['property.type'],
                name: obj['property.name'],
                address: {
                    street: obj['property.address.street'],
                    city: obj['property.address.city'],
                    state: obj['property.address.state'],
                    zipcode: obj['property.address.zipcode'],
                    country: obj['property.address.country']
                }
            };
        }

        // 2. If it's a stringified JSON
        if (typeof value === 'string' && value.trim().startsWith('{')) {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }

        return value;
    })
    property?: PropertyDto;


    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minBudget?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxBudget?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    durationDays?: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => DurationRangeDto)
    durationRange?: DurationRangeDto;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsEnum(PROJECT_STATUSES)
    status?: typeof PROJECT_STATUSES[number];

    @IsOptional()
    @IsEnum(PROJECT_RISK_LEVELS)
    riskLevel?: typeof PROJECT_RISK_LEVELS[number];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MilestoneDto)
    milestones?: MilestoneDto[];
}
