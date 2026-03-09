import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import CONFIG from '../config/config';
import User from '../models/user.model';
import { JwtPayload } from '@/user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const decoded = jwt.verify(token, CONFIG.ACCESS_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId).select('-password -refreshToken -activationCode -activationCodeExpires -resetPasswordCode -resetPasswordCodeExpires -address -notificationPreferences -heardAboutRiskfeed -properties -ownershipType');
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

