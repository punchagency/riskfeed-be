import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, ValidateNested, IsArray, IsDefined } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PROPERTIES_TYPES, PROPERTY_STATUS } from '@/models/properties.model';
import TryParseJSON from '@/utils/try-parse-json';

class AddressDto {
    @IsString()
    street: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    zipCode: string;

    @IsString()
    country: string;
}

export class CreatePropertyDto {
    @IsOptional()
    @IsString()
    'address.street'?: string;

    @IsOptional()
    @IsString()
    'address.city'?: string;

    @IsOptional()
    @IsString()
    'address.state'?: string;

    @IsOptional()
    @IsString()
    'address.zipCode'?: string;

    @IsOptional()
    @IsString()
    'address.country'?: string;


    @IsString()
    name: string;


    @IsEnum(PROPERTIES_TYPES)
    propertyType: typeof PROPERTIES_TYPES[number];

    @IsOptional()
    @IsEnum(PROPERTY_STATUS)
    status?: typeof PROPERTY_STATUS[number];

    @ValidateNested()
    @Type(() => AddressDto)
    @Transform(({ value, obj }) => {
        // 1. Check for flat keys (multipart/form-data with dot notation)
        if (obj['address.street'] !== undefined || obj['address.city'] !== undefined) {
            return {
                street: obj['address.street'],
                city: obj['address.city'],
                state: obj['address.state'],
                zipCode: obj['address.zipCode'],
                country: obj['address.country']
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
    address: AddressDto;



    @IsOptional()
    @IsDateString()
    purchaseDate?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    purchasePrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    estimatedValue?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    currentEstimatedValue?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    annualPropertyTax?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    annualInsurance?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    annualMaintenanceCosts?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    squareFeet?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    yearBuilt?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    noOfBedrooms?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    noOfBathrooms?: number;

    @IsOptional()
    @IsString()
    lotSize?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
