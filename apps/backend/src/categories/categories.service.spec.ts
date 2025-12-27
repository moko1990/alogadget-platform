import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../database/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';

const mockPrismaService = {
  category: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      const dto = { name: 'Mobile', slug: 'mobile' };
      prisma.category.findUnique.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);
      expect(result).toEqual({ id: '1', ...dto });
      expect(mockCacheManager.del).toHaveBeenCalledWith('categories_tree');
    });

    // --- اصلاح شده برای جلوگیری از کرش در Node 24 ---
    it('should throw error if slug exists', async () => {
      const dto = { name: 'Mobile', slug: 'mobile' };
      // شبیه‌سازی اینکه اسلاگ وجود دارد
      prisma.category.findUnique.mockResolvedValue({
        id: '1',
        slug: 'mobile',
      } as any);

      try {
        await service.create(dto);
        // اگر خطایی ندهد، یعنی تست فیل شده است
        fail('Should have thrown BadRequestException');
      } catch (error) {
        // اینجا خطا را بررسی می‌کنیم
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toContain('قبلاً وجود دارد');
      }
    });
    // ------------------------------------------------
  });

  describe('getTree', () => {
    it('should return cached tree if available', async () => {
      mockCacheManager.get.mockResolvedValue([{ id: '1', name: 'Cached' }]);
      const result = await service.getTree();
      expect(result).toEqual([{ id: '1', name: 'Cached' }]);
    });
  });
});
