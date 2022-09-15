import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { ShopSchema } from './schemas/shop.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Shop', schema: ShopSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [ShopService],
  controllers: [ShopController],
  exports:[ShopService]
})
export class ShopModule {}
