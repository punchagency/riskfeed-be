import { IsString, IsNotEmpty } from 'class-validator';
import Validate from '@/utils/Validate';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class InviteContractorDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    if (!Validate.mongoId(value)) {
      throw new BadRequestException('Invalid contractor ID');
    }
    return value;
  })
  contractorId: string;
}
