import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '../auth/dto/sign-up.dto';
import { UserDocument } from './schemas/user.schema';
import { generateRandomString } from '../utils/generateRandomString';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private mailService: MailService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(email: string): Promise<UserDocument | undefined> {
    const user = await this.userModel.findOne({ email }).select('+password');
    return user;
  }

  async create(createUserDto: CreateUserDto, addingUser: UserDocument | null) {
    let tempPassword: string;
    const user = await this.userModel.findOne({ email: createUserDto.email });
    if (user) {
      return null;
    }
    if (!addingUser && !createUserDto.password) {
      throw new HttpException('Password is required', 400);
    }
    let hashedPassword: string;
    if (addingUser) {
      tempPassword = generateRandomString(8);

      hashedPassword = await this.hashPassword(tempPassword);
    } else {
      hashedPassword = await this.hashPassword(createUserDto.password);
    }

    const groupId = addingUser ? addingUser.groupId : generateRandomString(10);

    const isAdmin = addingUser ? false : true;

    let userName: string;

    if (createUserDto.name) {
      userName = createUserDto.name;
    } else {
      userName = createUserDto.email.split('@')[0];
    }

    const newUser = new this.userModel({
      ...createUserDto,
      name: userName,
      password: hashedPassword,
      isPasswordConfirm: addingUser ? false : true,
      groupId,
      isAdmin,
    });

    await newUser.save();

    if (addingUser) {
      await this.mailService.sendMail(
        newUser.email,
        'Expense Tracker',
        './add-user',
        {
          name: newUser.name,
          addingUser: addingUser.name,
          password: tempPassword,
        },
      );
    }

    if (addingUser) {
      return { user: newUser, tempPassword };
    }
    return { user: newUser };
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
    if (updateUserDto.password) {
      const user = await this.userModel.findById(userId).select('+password');
      const isMatch = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.password,
      );
      if (!isMatch) {
        throw new HttpException('Password is incorrect', 400);
      }
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    if (updateUserDto.monthlyBudget) {
      const user = await this.userModel.findById(userId);
      const groupUsers = await this.getUsersByGroupId(user.groupId);
      for (const groupUser of groupUsers) {
        groupUser.monthlyBudget = updateUserDto.monthlyBudget;
        await groupUser.save();
      }
    }

    const user = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {
      new: true,
    });
    return user;
  }

  async getUsersByGroupId(groupId: string): Promise<UserDocument[]> {
    return this.userModel.find({ groupId });
  }

  async updatePushNotificationsToken(
    userId: string,
    token: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);

    if (!user.pushNotificationsTokens) {
      user.pushNotificationsTokens = [];
    }

    if (!user.pushNotificationsTokens.includes(token)) {
      user.pushNotificationsTokens.push(token);
    }
    await user.save();
    return user;
  }

  async deleteUser(userId: string): Promise<string> {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return 'User deleted';
  }
}
