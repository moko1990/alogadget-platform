import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CacheModule } from '@nestjs/cache-manager'; // اضافه شد

@Module({
  imports: [CacheModule.register()], // اضافه شد (یا با کانفیگ ردیس)
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
