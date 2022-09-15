import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '../auth/dto/sign-up.dto';
import { UserDocument } from './schemas/user.schema';
import { generateRandomString } from '../utils/generateRandomString';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(phone: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findOne({ phone }).select('+password');
    return user;
  }

  async create(
    createUserDto: CreateUserDto,
    addingUser: UserDocument | null,
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({ phone: createUserDto.phone });
    if (user) {
      return null;
    }
    if (!addingUser && !createUserDto.password) {
      throw new HttpException('Password is required', 400);
    }
    let hashedPassword: string;
    if (addingUser) {
      const tempPassword = generateRandomString(8);
      console.log(tempPassword);

      hashedPassword = await this.hashPassword(tempPassword);
    } else {
      hashedPassword = await this.hashPassword(createUserDto.password);
    }

    const groupId = addingUser ? addingUser.groupId : generateRandomString(10);

    const isAdmin = addingUser ? false : true;

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isPasswordConfirm: addingUser === null,
      groupId,
      isAdmin,
    });
    return newUser.save();
  }

  async findOneById(id: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findById(id);
    if (!user) {
      return null;
    }
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
    return user;
  }

  async getUsersByGroupId(groupId: string): Promise<UserDocument[]> {
    return this.userModel.find({ groupId });
  }
}
