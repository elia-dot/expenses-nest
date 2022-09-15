import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { ShopModule } from '../shop/shop.module';
import { ShopSchema } from '../shop/schemas/shop.schema';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ExpenseSchema } from './schemas/expense.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Expense', schema: ExpenseSchema }]),
    MongooseModule.forFeature([{ name: 'Shop', schema: ShopSchema }]),
    ShopModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
