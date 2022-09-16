import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserDocument | undefined> {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      return user;
    }
    return null;
  }

  async signup(createUserDto: CreateUserDto): Promise<any> {
    const { user } = await this.userService.create(createUserDto, null);
    if (!user) {
      throw new HttpException('User already exists', 400);
    }
    const payload = { user, sub: user.id };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new HttpException('Invalid credentials', 401);
    }
    const payload = { user, sub: user.id };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async updatePassword(
    user: UserDocument,
    oldPassword: string,
    newPassword: string,
  ): Promise<UserDocument> {
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (isMatch) {
      const hashedPassword = await this.userService.hashPassword(newPassword);
      const updatedUser = await this.userService.updateUser(user._id, {
        password: hashedPassword,
        isPasswordConfirm: true,
        ...user,
      });
      return updatedUser;
    }
  }
}
