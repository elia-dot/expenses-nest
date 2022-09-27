import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UpdateUserDto } from '../user/dto/update-user.dto';
import { generateRandomString } from '../utils/generateRandomString';
import { MailService } from '../mail/mail.service';
import { UserDocument } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
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
    const user = await this.userService.create(createUserDto, null);
    if (!user) {
      throw new HttpException('User already exists', 400);
    }
    const payload = { user, sub: user.user.id };
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

  async forgotPassword(email: string): Promise<any> {
    const user = await this.userService.findOne(email);

    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const tmpPassword = generateRandomString(8);
    try {
      this.mailService.sendMail(email, 'שחזור סיסמא', 'forgot-password', {
        name: user.name,
        code: tmpPassword,
      });
      const hashedPassword = await this.userService.hashPassword(tmpPassword);
      user.isPasswordConfirm = false;
      user.password = hashedPassword;
      await user.save();
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async updatePassword(
    user: UserDocument,
    newPassword: string,
  ): Promise<UserDocument> {
    const hashedPassword = await this.userService.hashPassword(newPassword);
    const updatedUser = await this.userService.updateUser(user._id, {
      password: hashedPassword,
      isPasswordConfirm: true,
    } as UpdateUserDto);
    return updatedUser;
  }
}
