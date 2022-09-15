import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ShopDocument = Shop & Document;

@Schema()
export class Shop {

  @Prop({ required: true })
  name: string;

  @Prop({default: 'שונות'})
  category: string;

  @Prop()
  createdForGroupId: string;

  @Prop({ default: false })
  isOnline: boolean;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);
