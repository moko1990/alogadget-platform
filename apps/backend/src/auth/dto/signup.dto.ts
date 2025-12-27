import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'ایمیل نامعتبر است' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'نام الزامی است' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'نام خانوادگی الزامی است' })
  lastName: string;

  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  password: string;
}
