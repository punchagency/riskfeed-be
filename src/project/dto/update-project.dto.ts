import { IsString, IsNumber, IsOptional, ValidateNested, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PROJECT_STATUSES, PROJECT_RISK_LEVELS, PROJECT_TYPES } from '@/models/project.model';

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
    @IsEnum(PROJECT_TYPES)
    projectType: typeof PROJECT_TYPES[number];

    @IsOptional()
    @IsString()
    propertyId?: string;

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
}
