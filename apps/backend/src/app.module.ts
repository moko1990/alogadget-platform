import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { VendorsModule } from './vendors/vendors.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    // 1. Config Module: اعتبارسنجی متغیرهای محیطی
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(4000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
      }),
    }),

    // 2. Throttler: جلوگیری از حملات DDoS (مثلا ۱۰ درخواست در دقیقه)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    // 3. Database Module
    DatabaseModule,

    AuthModule,

    CategoriesModule,

    ProductsModule,

    VendorsModule,

    FilesModule,
  ],
})
export class AppModule {}
