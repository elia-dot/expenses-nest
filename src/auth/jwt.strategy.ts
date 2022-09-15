import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';

import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const { user } = payload;
    return user;
  }
}
