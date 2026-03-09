import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CONFIG from '../config/config';
import User, { IUser, ROLES } from '../models/user.model';
import ContractorModel from '../models/contractor.model';
import MakeID from '../utils/MakeID';
import { RegisterUserDto } from './dto/register-user.dto';
import { ActivateAccountDto, ChangePasswordDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, ResendActivationCodeDto, ResendResetPasswordCodeDto, ResetPasswordDto, ValidateTokenDto} from './dto/auth-requests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { addEmailJob } from '../integrations/QueueManager';
const SALT_ROUNDS = 10;

export interface JwtPayload {
  userId: string;
  email: string;
  role: typeof ROLES[number];
}

@Injectable()
export class UserService {
  private signAccessToken(user: IUser): string {
    const payload: JwtPayload = { userId: user._id.toString(), role: user.role, email: user.email };
    return jwt.sign(payload, CONFIG.ACCESS_SECRET, {
      expiresIn: CONFIG.accessTokenJwtExpiresIn,
    });
  }
  private async signAndStoreRefreshToken(user: IUser): Promise<string> {
    const payload: JwtPayload = { userId: user._id.toString(), role: user.role, email: user.email };
    const refreshToken = jwt.sign(payload, CONFIG.REFRESH_SECRET, {
      expiresIn: CONFIG.refreshTokenJwtExpiresIn,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    user.refreshToken = hashedRefreshToken;
    await user.save();
    return refreshToken;
  }
  private async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  private sanitizeUser(user: IUser) {
    const { password, refreshToken, activationCode, activationCodeExpires, resetPasswordCode, resetPasswordCodeExpires, ...rest } = user.toObject();
    return rest;
  }
  async register(payload: RegisterUserDto) {
    const existing = await User.findOne({ email: payload.email.toLowerCase().trim() });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const activationCode = MakeID(6);
    const activationCodeExpires = new Date(
      Date.now() + CONFIG.settings.VERIFICATION_CODE_EXPIRATION_DURATION * 60 * 1000,
    );

    const { contractorData, ...userData } = payload;

    const user = await User.create({
      ...userData,
      email: payload.email.toLowerCase().trim(),
      phoneNumber: payload.phoneNumber.trim(),
      password: passwordHash,
      activationCode,
      activationCodeExpires,
      role: payload.role || (contractorData ? 'contractor' : 'user'),
    });

    // Create contractor profile if contractor data provided
    if (contractorData && user.role === 'contractor') {
      await ContractorModel.create({
        ...contractorData,
        user: user._id,
      } as any);
    }

    // Queue registration/activation email
    await addEmailJob({
      email: user.email,
      subject: 'Activate your RiskFeed account',
      html: `
        <p>Hi ${user.firstName},</p>
        <p>Thank you for registering on RiskFeed.</p>
        <p>Your activation code is: <strong>${activationCode}</strong></p>
        <p>This code will expire in ${CONFIG.settings.VERIFICATION_CODE_EXPIRATION_DURATION} minutes.</p>
      `,
    });

    return {
      message: 'Registration successful. Please activate your account with the code sent to your email.',
      user: this.sanitizeUser(user),
    };
  }
  async activateAccount(payload: ActivateAccountDto) {
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.activationCode || !user.activationCodeExpires) {
      throw new BadRequestException('No activation code set for this account');
    }
    if (user.activationCode !== payload.activationCode) {
      throw new BadRequestException('Invalid activation code');
    }
    if (user.activationCodeExpires.getTime() < Date.now()) {
      throw new BadRequestException('Activation code has expired');
    }

    user.status = 'active';
    user.activationCode = undefined;
    user.activationCodeExpires = undefined;
    await user.save();

    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.signAndStoreRefreshToken(user);

    return {
      message: 'Account activated successfully',
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }
  async resendActivationCode(payload: ResendActivationCodeDto) {
    const user = await User.findOne({ email: payload.email.toLowerCase().trim() });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status === 'active') {
      throw new BadRequestException('Account already active');
    }

    const activationCode = MakeID(6);
    const activationCodeExpires = new Date(
      Date.now() + CONFIG.settings.VERIFICATION_CODE_EXPIRATION_DURATION * 60 * 1000,
    );
    user.activationCode = activationCode;
    user.activationCodeExpires = activationCodeExpires;
    await user.save();

    await addEmailJob({
      email: user.email,
      subject: 'Your new RiskFeed activation code',
      html: `
        <p>Hi ${user.firstName},</p>
        <p>Your new activation code is: <strong>${activationCode}</strong></p>
        <p>This code will expire in ${CONFIG.settings.VERIFICATION_CODE_EXPIRATION_DURATION} minutes.</p>
      `,
    });

    return {
      message: 'Activation code resent successfully',
      activationCode,
    };
  }
  async login(payload: LoginDto) {
    const user = await User.findOne({ email: payload.email.toLowerCase().trim() });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }
    const valid = await this.validatePassword(payload.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.signAndStoreRefreshToken(user);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }
  async refreshToken(payload: RefreshTokenDto) {
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(payload.refreshToken, CONFIG.REFRESH_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const match = await bcrypt.compare(payload.refreshToken, user.refreshToken);
    if (!match) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.signAccessToken(user);
    const newRefreshToken = await this.signAndStoreRefreshToken(user);

    return {
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
  async validateToken(payload: ValidateTokenDto) {
    try {
      const decoded = jwt.verify(payload.token, CONFIG.ACCESS_SECRET) as JwtPayload;
      const user = await User.findById(decoded);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      return {
        valid: true,
        user: this.sanitizeUser(user),
      };
    } catch {
      return {
        valid: false,
      };
    }
  }
  async logout(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.refreshToken = '';
    await user.save();
    return {
      message: 'Logged out successfully',
    };
  }
  async getUser(userId: string){
    const user = await User.findById(userId).select('-password -refreshToken -activationCode -activationCodeExpires -resetPasswordCode -resetPasswordCodeExpires');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async getContractor(userId: string){
    const contractor = await ContractorModel.findOne({ user: userId});
    if (!contractor) {
      throw new NotFoundException('Contractor not found');
    }
    return contractor;
  }
  async getProfile(userId: string) {
    let response: any = {};
    const user: any = await User.findById(userId).select('-password -refreshToken -activationCode -activationCodeExpires -resetPasswordCode -resetPasswordCodeExpires');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    response.user = user;
    if(user.role === "contractor"){
      response.contractor = await this.getContractor(user._id.toString())
    }
    return response;
  }
  async updateProfile(userId: string, payload: UpdateProfileDto) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (payload.email) {
      const existing = await User.findOne({
        _id: { $ne: userId },
        email: payload.email.toLowerCase().trim(),
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
      user.email = payload.email.toLowerCase().trim();
    }
    if(payload.phoneNumber){
      const existing = await User.findOne({
        _id: { $ne: userId },
        phoneNumber: payload.phoneNumber.trim(),
      });
      if (existing) {
        throw new BadRequestException('Phone number already in use');
      }
      user.phoneNumber = payload.phoneNumber.trim();
    }

    if (payload.firstName !== undefined) user.firstName = payload.firstName;
    if (payload.lastName !== undefined) user.lastName = payload.lastName;
    if (payload.profilePicture !== undefined) user.profilePicture = payload.profilePicture;

    if (payload.address) {
      user.address = {
        ...user.address,
        ...payload.address,
      };
    }

    if (payload.notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...payload.notificationPreferences,
      };
    }

    if (payload.role) {
      user.role = payload.role;
    }
    if (payload.status) {
      user.status = payload.status;
    }

    // Homeowner fields
    if (payload.ownershipType !== undefined) user.ownershipType = payload.ownershipType;
    if (payload.properties !== undefined) user.properties = payload.properties as any;
    if (payload.heardAboutRiskfeed !== undefined) user.heardAboutRiskfeed = payload.heardAboutRiskfeed as any;

    await user.save();

    // Update contractor profile if contractor data provided
    if (payload.contractorData && user.role === 'contractor') {
      const contractor = await ContractorModel.findOne({ user: user._id as any });
      if (contractor) {
        Object.assign(contractor, payload.contractorData);
        await contractor.save();
      } else {
        await ContractorModel.create({
          ...payload.contractorData,
          user: user._id,
        } as any);
      }
    }

    return this.sanitizeUser(user);
  }
  async changePassword(userId: string, payload: ChangePasswordDto) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const valid = await this.validatePassword(payload.currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(payload.newPassword, SALT_ROUNDS);
    user.password = newHash;
    await user.save();

    return {
      message: 'Password changed successfully',
    };
  }
  async forgotPassword(payload: ForgotPasswordDto) {
    const user = await User.findOne({ email: payload.email.toLowerCase().trim() });
    if (!user) {
      return {
        message: 'If an account with that email exists, a reset code has been sent',
      };
    }

    const resetPasswordCode = MakeID(6);
    const resetPasswordCodeExpires = new Date(
      Date.now() + CONFIG.settings.VERIFICATION_CODE_EXPIRATION_DURATION * 60 * 1000,
    );
    user.resetPasswordCode = resetPasswordCode;
    user.resetPasswordCodeExpires = resetPasswordCodeExpires;
    await user.save();

    await addEmailJob({
      email: user.email,
      subject: 'Reset your RiskFeed password',
      html: `
        <p>Hi ${user.firstName},</p>
        <p>You requested to reset your password.</p>
        <p>Your reset code is: <strong>${resetPasswordCode}</strong></p>
        <p>This code will expire in ${CONFIG.settings.VERIFICATION_CODE_EXPIRATION_DURATION} minutes.</p>
      `,
    });

    return {
      message: 'Reset password code generated successfully',
      resetPasswordCode,
    };
  }
  async resendResetPasswordCode(payload: ResendResetPasswordCodeDto) {
    const user = await User.findOne({ email: payload.email.toLowerCase().trim() });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetPasswordCode = MakeID(6);
    const resetPasswordCodeExpires = new Date(
      Date.now() + CONFIG.settings.VERIFICATION_CODE_EXPIRATION_DURATION * 60 * 1000,
    );
    user.resetPasswordCode = resetPasswordCode;
    user.resetPasswordCodeExpires = resetPasswordCodeExpires;
    await user.save();

    await addEmailJob({
      email: user.email,
      subject: 'Your new RiskFeed password reset code',
      html: `
        <p>Hi ${user.firstName},</p>
        <p>Your new password reset code is: <strong>${resetPasswordCode}</strong></p>
        <p>This code will expire in ${CONFIG.settings.VERIFICATION_CODE_EXPIRATION_DURATION} minutes.</p>
      `,
    });

    return {
      message: 'Reset password code resent successfully',
      resetPasswordCode,
    };
  }
  async resetPassword(payload: ResetPasswordDto) {
    const user = await User.findOne({ email: payload.email.toLowerCase().trim() });
    if (!user || !user.resetPasswordCode || !user.resetPasswordCodeExpires) {
      throw new BadRequestException('Invalid reset password request');
    }

    if (user.resetPasswordCode !== payload.resetPasswordCode) {
      throw new BadRequestException('Invalid reset password code');
    }

    if (user.resetPasswordCodeExpires.getTime() < Date.now()) {
      throw new BadRequestException('Reset password code has expired');
    }

    const newHash = await bcrypt.hash(payload.newPassword, SALT_ROUNDS);
    user.password = newHash;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpires = undefined;
    await user.save();

    return {
      message: 'Password reset successfully',
    };
  }
}

