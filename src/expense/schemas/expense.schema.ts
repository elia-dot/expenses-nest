import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

import { ShopDocument } from '../../shop/schemas/shop.schema';
import { UserDocument } from '../../user/schemas/user.schema';

export type ExpenseDocument = Expense & Document;

@Schema()
export class Expense {
  @Prop({ required: true })
  amount: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true })
  shop: ShopDocument;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({})
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: UserDocument;

  @Prop({ default: 1 })
  installments: number;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
