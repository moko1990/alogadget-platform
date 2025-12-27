import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
// 1. ایمپورت به صورت Namespace (بدون type)
import * as Express from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  // 2. استفاده از Express.Response
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const data = await this.authService.signup(dto);
    this.setRefreshTokenCookie(res, data.refreshToken);
    return { user: data.user, accessToken: data.accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const data = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, data.refreshToken);
    return { user: data.user, accessToken: data.accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Express.Request,
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) return { message: 'No token provided' };

    // اینجا باید منطق رفرش را کامل کنید
    return { message: 'Refresh logic needs implementation' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getAdminData() {
    return { message: 'فقط ادمین این را می‌بیند' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie('refreshToken');
    return { message: 'خروج موفقیت‌آمیز' };
  }

  // --- Helper ---
  private setRefreshTokenCookie(res: Express.Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
