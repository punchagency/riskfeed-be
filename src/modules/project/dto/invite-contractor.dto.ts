import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEmail } from 'class-validator';
import Validate from '@/utils/Validate';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class InviteContractorDto {

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (value && !Validate.mongoId(value)) {
      throw new BadRequestException('Invalid contractor ID');
    }
    return value;
  })
  contractorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Personal message must not exceed 1000 characters' })
  message?: string;

  @IsOptional()
  @IsEmail()
  contractorEmail?: string;
}
