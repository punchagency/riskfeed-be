import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ValidateTokenDto {
  @IsString()
  token: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ActivateAccountDto {
  @IsEmail()
  email: string;

  @IsString()
  activationCode: string;
}

export class ResendActivationCodeDto {
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResendResetPasswordCodeDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  resetPasswordCode: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

