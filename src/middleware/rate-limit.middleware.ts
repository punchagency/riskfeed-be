import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisUtils } from '../utils/RedisUtils';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly limit = 300; // requests
  private readonly windowSeconds = 60; // per 60 seconds

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const identifier = `${req.ip}:${req.path}`;

    const { allowed, remaining, resetTime } = await RedisUtils.checkRateLimit(
      identifier,
      this.limit,
      this.windowSeconds,
    );

    res.setHeader('X-RateLimit-Limit', this.limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.floor(resetTime / 1000).toString());

    if (!allowed) {
      res.status(429).json({
        message: 'Too many requests. Please try again later.',
      });
      return;
    }

    next();
  }
}

