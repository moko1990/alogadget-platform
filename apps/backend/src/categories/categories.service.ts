import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as CacheManager from 'cache-manager';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    @Inject(CACHE_MANAGER)
    private cacheManager: CacheManager.Cache, // این خط الان درست کار می‌کند
  ) {}

  // --- CREATE ---
  async create(dto: CreateCategoryDto) {
    // 1. چک کردن تکراری نبودن Slug
    const existingSlug = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existingSlug) {
      throw new BadRequestException(
        `دسته‌بندی با اسلاگ "${dto.slug}" قبلاً وجود دارد.`,
      );
    }

    // 2. چک کردن وجود Parent و محدودیت عمق (Max Depth: 5)
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('دسته‌بندی والد یافت نشد.');

      const depth = await this.getCategoryDepth(dto.parentId);
      if (depth >= 5) {
        throw new BadRequestException('حداکثر عمق دسته‌بندی (۵ سطح) مجاز است.');
      }
    }

    // 3. ایجاد دسته‌بندی
    const category = await this.prisma.category.create({
      data: dto,
    });

    // 4. پاک کردن کش درخت دسته‌بندی‌ها
    await this.invalidateCache();

    return category;
  }

  // --- READ (TREE) ---
  async getTree() {
    // 1. چک کردن کش
    const cachedTree = await this.cacheManager.get('categories_tree');
    if (cachedTree) {
      return cachedTree;
    }

    // 2. دریافت از دیتابیس (فقط ریشه‌ها را می‌گیریم و با include فرزندان را می‌آوریم)
    // نکته: Prisma هنوز include بازگشتی نامحدود ندارد، پس تا ۵ سطح دستی include می‌کنیم
    // یا روش بهتر: همه را فلت می‌گیریم و در مموری درخت می‌سازیم (برای پرفورمنس بهتر)
    const allCategories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    const tree = this.buildTree(allCategories);

    // 3. ذخیره در کش (برای ۱ ساعت)
    await this.cacheManager.set('categories_tree', tree, 3600000); // 1 hour in ms

    return tree;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد.');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });
    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد.');
    return category;
  }

  // --- UPDATE ---
  async update(id: string, dto: UpdateCategoryDto) {
    // چک وجود
    await this.findOne(id);

    if (dto.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'این اسلاگ توسط دسته دیگری استفاده شده است.',
        );
      }
    }

    // جلوگیری از Circular Dependency (پدر خودش را فرزند خودش نکند)
    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException('یک دسته نمی‌تواند والد خودش باشد.');
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    await this.invalidateCache();
    return updated;
  }

  // --- DELETE ---
  async remove(id: string) {
    // به دلیل onDelete: Cascade در Prisma، فرزندان خودکار حذف می‌شوند.
    // اما شاید بخواهیم چک کنیم محصولی نداشته باشد.
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) throw new NotFoundException('دسته‌بندی یافت نشد.');

    if (category.products.length > 0) {
      throw new BadRequestException(
        'این دسته دارای محصول است و نمی‌توان آن را حذف کرد.',
      );
    }

    await this.prisma.category.delete({ where: { id } });
    await this.invalidateCache();
    return { message: 'دسته‌بندی و زیرمجموعه‌های آن حذف شدند.' };
  }

  // --- HELPERS ---

  private async invalidateCache() {
    await this.cacheManager.del('categories_tree');
  }

  // تبدیل لیست فلت به درخت (Algorithm: O(n))
  private buildTree(categories: any[], parentId: string | null = null): any[] {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, cat.id),
      }));
  }

  // محاسبه عمق برای جلوگیری از Stack Overflow
  private async getCategoryDepth(categoryId: string): Promise<number> {
    let depth = 0;
    let currentId = categoryId;

    while (currentId) {
      depth++;
      const parent = await this.prisma.category.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
      if (!parent || !parent.parentId) break;
      currentId = parent.parentId;
    }
    return depth;
  }
}
