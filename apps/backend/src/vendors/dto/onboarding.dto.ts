import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class OnboardingDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  bankAccount: string; // شماره شبا (بعدا باید رمزنگاری شود)
}
