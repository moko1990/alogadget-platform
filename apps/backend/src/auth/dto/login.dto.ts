import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'ایمیل نامعتبر است' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'رمز عبور الزامی است' })
  password: string;
}