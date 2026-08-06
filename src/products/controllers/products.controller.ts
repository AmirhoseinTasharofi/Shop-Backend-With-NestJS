import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductQueryDto } from '../dtos/product-query.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query() query: ProductQueryDto ,
  ) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }
}
