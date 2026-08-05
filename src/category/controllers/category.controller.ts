import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CategoryService } from '../services/category.service';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('slug') slug: string,
  ) {
    return this.categoryService.findOneBySlug(slug);
  }
}