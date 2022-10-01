import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import  { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ required: true })
  groupId: string;

  @Prop({ default: false })
  isPasswordConfirm: boolean;

  @Prop({ default: 0 })
  monthlyBudget: number;

  @Prop({ default: true })
  allowNotifications: boolean;

  @Prop()
  pushNotificationsTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
