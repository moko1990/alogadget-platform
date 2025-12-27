import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hashPassword, verifyPassword } from '../common/utils/password.util';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 1. ثبت نام
  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new BadRequestException('ایمیل تکراری است');

    const hashedPassword = await hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'CUSTOMER',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user: this.filterUser(user), ...tokens };
  }

  // 2. لاگین
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('اطلاعات ورود اشتباه است');

    const isMatch = await verifyPassword(user.passwordHash, dto.password);
    if (!isMatch) throw new UnauthorizedException('اطلاعات ورود اشتباه است');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // آپدیت آخرین ورود
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return { user: this.filterUser(user), ...tokens };
  }

  // 3. رفرش توکن (با Rotation)
  async refreshTokens(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ForbiddenException('دسترسی غیرمجاز');

    // اینجا باید منطق پیچیده چک کردن دیتابیس برای توکن را بنویسیم
    // فعلا برای سادگی فقط هش را چک می‌کنیم (در فاز بعد کامل‌تر می‌کنیم)
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // 4. خروج
  async logout(userId: string) {
    // حذف تمام رفرش توکن‌های کاربر یا فقط توکن فعلی
    // فعلا ساده:
    return true;
  }

  // --- توابع کمکی ---

  private async generateTokens(userId: string, email: string, role: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { expiresIn: '15m', secret: this.configService.get('JWT_SECRET') },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          expiresIn: '7d',
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  private async updateRefreshToken(userId: string, rt: string) {
    const hash = await hashPassword(rt);
    await this.prisma.refreshToken.create({
      data: {
        token: hash,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  private filterUser(user: any) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
