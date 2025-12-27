import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express'; // اضافه شد
import { join } from 'path';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // تغییر نوع اپلیکیشن به NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // سرو کردن پوشه uploads
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3000);
  app.use(cookieParser()); // اضافه شد
}
bootstrap();
