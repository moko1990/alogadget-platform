import { Test, TestingModule } from '@nestjs/testing';
import { VendorsService } from './vendors.service';
import { PrismaService } from '../database/prisma.service';

const mockPrismaService = {
  vendor: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('VendorsService', () => {
  let service: VendorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        { provide: PrismaService, useValue: mockPrismaService }, // تزریق ماک
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
