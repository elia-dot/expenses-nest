import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopService } from './shop.service';

@UseGuards(JwtAuthGuard)
@Controller('shops')
export class ShopController {
  constructor(private shopService: ShopService) {}

  
  @Get('categories')
  async getCategories(@Res() res) {
    const categories = await this.shopService.getCategories();
    return res.status(200).json(categories);
  }

  
  @Get('without-category')
  async getShopsWithoutCategory(@Res() res, @Req() req) {
    const shops = await this.shopService.getShopsWithoutCategory(
      req.user.groupId,
    );
    return res.status(200).json(shops);
  }

  
  @Get()
  async getShops(@Res() res, @Req() req) {
    const shops = await this.shopService.getShops(req.user.groupId);
    return res.status(200).json(shops);
  }

  @Get('shops-by-category')
  async getShopsByCategory(@Res() res, @Req() req) {
    const shops = await this.shopService.getShopsByCategory(req.user.groupId);
    return res.status(200).json(shops);
  }

  
  @Get(':id')
  async getShopById(@Res() res, @Param('id') id: string) {
    const shop = await this.shopService.getShopById(id);
    if (!shop) {
      return res.status(400).json({ error: 'Shop not found' });
    }
    return res.status(200).json(shop);
  }

  
  @Delete(':id')
  async deleteShop(@Res() res, @Param('id') id: string) {
    const shop = await this.shopService.deleteShop(id);
    if (!shop) {
      return res.status(400).json({ error: 'Shop not found' });
    }
    return res.status(200).json({ message: 'Shop deleted' });
  }

  
  @Patch(':id')
  async updateShop(
    @Res() res,
    @Req() req,
    @Param('id') id: string,
    @Body() shopDto: UpdateShopDto,
  ) {
    const shop = await this.shopService.updateShop(id, req.user.groupId, shopDto);
    if (!shop) {
      return res.status(400).json({ error: 'Shop not found' });
    }
    return res.status(200).json({ shop });
  }
}
