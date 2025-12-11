import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-change-me',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Received payload:', payload);
    const user = {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      roles: payload.roles,
    };
    console.log('JWT Strategy - Returning user:', user);
    return user;
  }
}
