import { IsOptional, IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PROJECT_TYPES } from '@/models/project.model';
import { PROPERTIES_TYPES } from '@/models/properties.model';

export class GetOpportunitiesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minMatchPercentage?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  maxMatchPercentage?: number;

  @IsOptional()
  @IsString()
  propertyState?: string;

  @IsOptional()
  @IsEnum(PROPERTIES_TYPES)
  propertyType?: typeof PROPERTIES_TYPES[number];

  @IsOptional()
  @IsEnum(PROJECT_TYPES)
  projectType?: typeof PROJECT_TYPES[number];
}
