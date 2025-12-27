import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'نام دسته‌بندی الزامی است' })
  @MaxLength(100, {
    message: 'نام دسته‌بندی نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'اسلاگ الزامی است' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'اسلاگ باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد',
  })
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsUUID('4', { message: 'فرمت Parent ID نامعتبر است' })
  @IsOptional()
  parentId?: string;
}
