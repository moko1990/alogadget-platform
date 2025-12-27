import { IsEnum, IsNotEmpty } from 'class-validator';
import { VendorStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(VendorStatus)
  @IsNotEmpty()
  status: VendorStatus;
}
