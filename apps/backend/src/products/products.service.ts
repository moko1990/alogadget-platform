import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as CacheManager from 'cache-manager';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    @Inject(CACHE_MANAGER)
    private cacheManager: CacheManager.Cache,
  ) {}

  // --- CREATE (TRANSACTION) ---
  async create(vendorId: string, dto: CreateProductDto) {
    // 1. چک کردن Slug
    const existing = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });
    if (existing)
      throw new BadRequestException('این اسلاگ قبلاً استفاده شده است');

    // 2. محاسبه قیمت پایه (کمترین قیمت بین واریانت‌ها)
    const basePrice = Math.min(...dto.variants.map((v) => v.price));

    // 3. تراکنش دیتابیس (همه یا هیچ)
    // اگر ساخت واریانت شکست بخورد، محصول هم ساخته نمی‌شود
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        basePrice: basePrice,
        status: dto.status || 'DRAFT',
        vendor: { connect: { id: vendorId } }, // وصل کردن به فروشنده
        category: { connect: { id: dto.categoryId } },

        // ایجاد واریانت‌ها همزمان
        variants: {
          create: dto.variants.map((v) => ({
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            attributes: v.attributes, // JSON ذخیره می‌شود
          })),
        },

        // ایجاد عکس‌ها همزمان
        images: {
          create: dto.images?.map((img) => ({
            url: img.url,
            alt: img.alt,
            isMain: img.isMain || false,
          })),
        },
      },
      include: { variants: true, images: true },
    });

    return product;
  }

  // --- FIND ALL (FILTERING) ---
  async findAll(query: ProductQueryDto) {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    // ساخت شرط‌های جستجو
    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED', // فقط محصولات منتشر شده
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
      ...(minPrice || maxPrice
        ? {
            variants: {
              some: {
                price: {
                  gte: minPrice,
                  lte: maxPrice,
                },
              },
            },
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: { where: { isMain: true } }, // فقط عکس اصلی برای لیست
          vendor: { select: { storeName: true } }, // نام فروشگاه
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // --- FIND ONE (CACHE) ---
  async findOne(slug: string) {
    // 1. چک کش
    const cacheKey = `product:${slug}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // 2. دریافت از دیتابیس
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        images: { orderBy: { order: 'asc' } },
        vendor: { select: { id: true, storeName: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!product) throw new NotFoundException('محصول یافت نشد');

    // 3. ذخیره در کش (برای ۱۰ دقیقه)
    await this.cacheManager.set(cacheKey, product, 600000);

    return product;
  }

  // --- UPDATE STOCK (CONCURRENCY SAFE) ---
  async updateStock(variantId: string, quantityChange: number) {
    // استفاده از updateтоمی‌تواند اتمیک باشد (increment/decrement)
    // این روش در دیتابیس Lock ایجاد نمی‌کند اما اتمیک است و امن
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: { increment: quantityChange }, // مثلا -1 یا +5
      },
    });
  }
}
