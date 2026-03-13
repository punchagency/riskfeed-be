import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ActivateAccountDto, ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, ResendActivationCodeDto, ResendResetPasswordCodeDto, ResetPasswordDto, ValidateTokenDto } from './dto/auth-requests.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddLinkedUserDto } from './dto/linked-account.dto';
import type AuthenticatedRequest from '@/auth/auth-user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() payload: RegisterUserDto, @Req() req: any) {
    const files = (req as any).files as { profilePicture?: Array<{ location: string }>, companyLogo?: Array<{ location: string }> } | undefined;
    
    if (files?.profilePicture?.[0]?.location) {
      payload.profilePicture = files.profilePicture[0].location;
    }
    
    if (files?.companyLogo?.[0]?.location && payload.contractorData) {
      payload.contractorData.companyLogo = files.companyLogo[0].location;
    }
    
    return this.userService.register(payload);
  }

  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.userService.login(payload);
  }

  @Post('refresh-token')
  refreshToken(@Body() payload: RefreshTokenDto) {
    return this.userService.refreshToken(payload);
  }

  @Post('validate-token')
  validateToken(@Body() payload: ValidateTokenDto) {
    return this.userService.validateToken(payload);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: AuthenticatedRequest) {
    return this.userService.logout(req.user._id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: AuthenticatedRequest, @Body() payload: ChangePasswordDto) {
    return this.userService.changePassword(req.user._id, payload);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    return await this.userService.getProfile(req?.user?._id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req: AuthenticatedRequest, @Body() payload: UpdateProfileDto) {
    const files = (req as any).files as { companyLogo?: Array<{ location: string }> } | undefined;
    
    if (files?.companyLogo?.[0]?.location && payload.contractorData) {
      payload.contractorData.companyLogo = files.companyLogo[0].location;
    }
    
    return this.userService.updateProfile(req?.user?._id, payload);
  }

  @Post('linked-accounts')
  @UseGuards(JwtAuthGuard)
  addLinkedUser(@Req() req: AuthenticatedRequest, @Body() payload: AddLinkedUserDto) {
    return this.userService.addLinkedUser(req.user._id, payload);
  }

  @Get('linked-accounts')
  @UseGuards(JwtAuthGuard)
  getLinkedAccounts(@Req() req: AuthenticatedRequest) {
    return this.userService.getLinkedAccounts(req.user._id);
  }

  @Delete('linked-accounts/:id')
  @UseGuards(JwtAuthGuard)
  removeLinkedAccount(@Req() req: AuthenticatedRequest, @Param('id') linkedUserId: string) {
    return this.userService.removeLinkedUser(req.user._id, linkedUserId);
  }

  @Post('activate-account')
  activateAccount(@Body() payload: ActivateAccountDto) {
    return this.userService.activateAccount(payload);
  }

  @Post('resend-activation-code')
  resendActivationCode(@Body() payload: ResendActivationCodeDto) {
    return this.userService.resendActivationCode(payload);
  }

  @Post('forgot-password')
  forgotPassword(@Body() payload: ForgotPasswordDto) {
    return this.userService.forgotPassword(payload);
  }

  @Post('resend-reset-password-code')
  resendResetPasswordCode(@Body() payload: ResendResetPasswordCodeDto) {
    return this.userService.resendResetPasswordCode(payload);
  }

  @Post('reset-password')
  resetPassword(@Body() payload: ResetPasswordDto) {
    return this.userService.resetPassword(payload);
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}

