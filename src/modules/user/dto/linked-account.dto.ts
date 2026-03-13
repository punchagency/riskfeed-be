import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ACCOUNT_ROLES } from '../../../models/user.model';

export class AddLinkedUserDto {
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
  @IsEnum(ACCOUNT_ROLES)
  accountRole?: typeof ACCOUNT_ROLES[number];
}
