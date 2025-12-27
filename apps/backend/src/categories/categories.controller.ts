import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('categories')
@UseInterceptors(ClassSerializerInterceptor) // برای فیلتر کردن خروجی‌ها (اگر لازم باشد)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // --- PUBLIC ENDPOINTS ---

  @Get('tree')
  // کشینگ در سطح کنترلر هم می‌تواند باشد، اما ما در سرویس هندل کردیم
  // @UseInterceptors(CacheInterceptor)
  // @CacheTTL(3600) // 1 hour
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  // --- PROTECTED ENDPOINTS (ADMIN ONLY) ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
