import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { VendorStatus } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  // 1. ثبت درخواست فروشندگی (Onboarding)
  async onboard(userId: string, dto: OnboardingDto) {
    // چک کنیم قبلاً درخواست نداده باشد
    const existing = await this.prisma.vendor.findUnique({ where: { userId } });
    if (existing) {
      throw new BadRequestException('شما قبلاً درخواست داده‌اید.');
    }

    // ایجاد رکورد فروشنده (وضعیت پیش‌فرض PENDING است)
    return this.prisma.vendor.create({
      data: {
        userId,
        storeName: dto.storeName,
        // سایر فیلدها مثل آدرس و بانک را فعلاً در مدل نداریم، باید به مدل اضافه شوند
        // یا در یک فیلد JSON ذخیره شوند. برای سادگی فعلاً فقط storeName
        status: 'PENDING',
      },
    });
  }

  // 2. تایید یا رد توسط ادمین
  async updateStatus(id: string, status: VendorStatus) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('فروشنده یافت نشد');

    return this.prisma.vendor.update({
      where: { id },
      data: { status },
    });
  }

  // 3. لیست درخواست‌های در انتظار (برای ادمین)
  async findPending() {
    return this.prisma.vendor.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });
  }

  // 4. دریافت پروفایل خود فروشنده
  async findMyProfile(userId: string) {
    return this.prisma.vendor.findUnique({ where: { userId } });
  }
}
