import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PROJECT_TYPES } from '@/models/project.model';

export class GetContractorsFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(PROJECT_TYPES, { each: true })
    speciality?: typeof PROJECT_TYPES[number];

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minRating?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxRiskScore?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 30;
}
