import { Test, TestingModule } from '@nestjs/testing';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

const mockVendorsService = {
  onboard: jest.fn(),
  findMyProfile: jest.fn(),
  findPending: jest.fn(),
  updateStatus: jest.fn(),
};

describe('VendorsController', () => {
  let controller: VendorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [
        { provide: VendorsService, useValue: mockVendorsService }, // تزریق ماک
      ],
    }).compile();

    controller = module.get<VendorsController>(VendorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
