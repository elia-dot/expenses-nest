import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseModule, FirebaseService } from '@speakbox/nestjs-firebase-admin';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { ShopModule } from './shop/shop.module';
import { ExpenseModule } from './expense/expense.module';
import { MailModule } from './mail/mail.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule, PassportModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    ShopModule,
    ExpenseModule,
    MailModule,
    FirebaseModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseService],
})
export class AppModule {}
