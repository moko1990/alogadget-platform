import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  // اینجا می‌توانیم لاجیک ریسایز کردن با sharp را اضافه کنیم
  // فعلاً فقط مسیر فایل را برمی‌گردانیم
  uploadFile(file: Express.Multer.File) {
    // در محیط واقعی، اینجا فایل را به S3 می‌فرستیم
    // فعلاً فرض می‌کنیم فایل در پوشه public ذخیره شده
    return {
      url: `http://localhost:4000/uploads/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }
}
