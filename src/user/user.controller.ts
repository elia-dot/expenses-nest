import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from '../auth/dto/sign-up.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async findAll(@Res() res) {
    const users = await this.userService.findAll();
    return res.status(200).json(users);
  }

  @Post('create-user')
  async createUser(
    @Res() res,
    @Req() req,
    @Body() createUserDto: CreateUserDto,
  ) {
    const user = await this.userService.create(createUserDto, req.user);
    if (!user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    return res.status(201).json(user);
  }

  @Get('me')
  async getMe(@Req() req) {
    return req.user;
  }

  @Get('group-users')
  async getUsersByGroupId(@Res() res, @Req() req) {
    const users = await this.userService.getUsersByGroupId(req.user.groupId);
    return res.status(200).json(users);
  }

  @Get(':id')
  async getUserById(@Res() res, @Param('id') id: string) {
    const user = await this.userService.findOneById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  }
}