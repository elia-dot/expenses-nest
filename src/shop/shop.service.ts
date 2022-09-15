import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop, ShopDocument } from './schemas/shop.schema';

@Injectable()
export class ShopService {
  constructor(@InjectModel('Shop') private shopModel: Model<ShopDocument>) {}

  async getShops(groupId: string): Promise<Shop[]> {
    return this.shopModel.find({ createdForGroupId: groupId }).exec();
  }

  async getShop(
    name: string,
    groupId: string,
  ): Promise<ShopDocument | undefined> {
    return this.shopModel.findOne({ name, createdForGroupId: groupId });
  }

  async createShop(
    name: string,
    groupId: string,
  ): Promise<ShopDocument | undefined> {
    const isShopExists = (await this.getShop(name.trim(), groupId)) !== null;

    if (isShopExists) {
      return null;
    }
    const createdForGroupId = groupId;
    const shop = new this.shopModel({ name: name.trim(), createdForGroupId });

    return shop.save();
  }

  async deleteShop(id: string): Promise<Shop | undefined> {
    return this.shopModel.findByIdAndRemove(id);
  }

  async updateShop(
    id: string,
    groupId: string,
    shopDto: UpdateShopDto,
  ): Promise<Shop | undefined> {
    const shop = await this.getShopById(id);
    if (shop.createdForGroupId !== groupId) {
      throw new HttpException('Shop not in your group', 401);
    }
    return this.shopModel.findByIdAndUpdate(id, shopDto, { new: true });
  }

  async getShopById(id: string): Promise<Shop | undefined> {
    return this.shopModel.findById(id);
  }

  async getShopsWithoutCategory(groupId: string): Promise<Shop[]> {
    return this.shopModel
      .find({ category: 'שונות', createdForGroupId: groupId })
      .exec();
  }

  async getCategories(): Promise<string[]> {
    return this.shopModel.distinct('category');
  }

  async getShopsByCategory(groupId: string): Promise<any> {
    const shops = await this.getShops(groupId);
    const categories = await this.getCategories();
    const shopsByCategory = categories.map((category) => {
      return {
        category,
        shops: shops.filter((shop) => shop.category === category),
      };
    });
    return shopsByCategory;
  }
}
