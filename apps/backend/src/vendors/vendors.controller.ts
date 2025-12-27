import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard) // همه روت‌ها نیاز به لاگین دارند
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  // ثبت نام فروشنده (هر کاربری می‌تواند درخواست دهد)
  @Post('onboard')
  onboard(@CurrentUser() user: any, @Body() dto: OnboardingDto) {
    return this.vendorsService.onboard(user.id, dto);
  }

  // مشاهده پروفایل خود
  @Get('me')
  getMyProfile(@CurrentUser() user: any) {
    return this.vendorsService.findMyProfile(user.id);
  }

  // لیست در انتظار (فقط ادمین)
  @Get('pending')
  @Roles('ADMIN')
  findPending() {
    return this.vendorsService.findPending();
  }

  // تغییر وضعیت (فقط ادمین)
  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.vendorsService.updateStatus(id, dto.status);
  }
}
