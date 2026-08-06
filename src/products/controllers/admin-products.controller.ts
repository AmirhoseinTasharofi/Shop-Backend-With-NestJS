import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { multerOptions } from 'src/common/upload/multer.config';
import { AdminProductsService } from '../services/admin-products.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { AdminProductQueryDto } from '../dtos/admin-product-query.dto';

@ApiTags('Admin Products')
@ApiBearerAuth('access-token')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.findOne(id);
  }

  @Get()
  findAll(
    @Query() query: AdminProductQueryDto,
  ) {
    return this.adminProductsService.findAll(query);
  }
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'string' },
        salePrice: { type: 'string' },
        stock: { type: 'number' },
        categoryId: { type: 'number' },
        status: { type: 'string' },

        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 20, multerOptions()))
  create(
    @Body() body: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.adminProductsService.create(body, files);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',

      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'string' },
        salePrice: { type: 'string' },
        stock: { type: 'number' },
        categoryId: { type: 'number' },
        status: { type: 'string' },

        deletedImageIds: {
          type: 'string',
          example: '[3,5]',
        },

        imageChanges: {
          type: 'string',
          example: '[{"id":2,"sortOrder":0,"isMain":true}]',
        },

        newImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('newImages', 20, multerOptions()))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    
    return this.adminProductsService.update(id, body, files);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.remove(id);
  }
}
