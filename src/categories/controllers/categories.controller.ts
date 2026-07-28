import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('slug') slug: string,
  ) {
    return this.categoriesService.findOneBySlug(slug);
  }
}