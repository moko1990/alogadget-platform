import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

const mockCategoriesService = {
  create: jest.fn((dto) => ({ id: '1', ...dto })),
  getTree: jest.fn(() => []),
  update: jest.fn((id, dto) => ({ id, ...dto })),
  remove: jest.fn((id) => ({ message: 'deleted' })),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a category', async () => {
    const dto = { name: 'Test', slug: 'test' };
    expect(await controller.create(dto)).toEqual({ id: '1', ...dto });
  });

  it('should get tree', async () => {
    expect(await controller.getTree()).toEqual([]);
  });
});
