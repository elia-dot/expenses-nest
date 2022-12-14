import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/sign-up.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  async signup(@Res() res, @Req() req, @Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);
    if (!user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    req.user = user.user;
    return res.status(201).json({ access_token: user.access_token });
  }

  @Post('login')
  async login(@Res() res, @Req() req, @Body() loginDto: LoginDto) {
    const user = await this.authService.login(loginDto);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.user = user.user;
    return res.status(200).json({ access_token: user.access_token });
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(
    @Res() res,
    @Req() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const user = await this.authService.updatePassword(
      req.user,
      updatePasswordDto.newPassword,
    );
    res.status(200).json({ user });
  }

  @Post('forgot-password/:email')
  async forgotPassword(@Res() res, @Param('email') email: string) {
    const user = await this.authService.forgotPassword(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'Check your email' });
  }
}
