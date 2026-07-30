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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { AdminProductsService } from '../services/admin-products.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/upload/multer.config';
import { UploadFolders } from 'src/common/upload/upload.constants';

@ApiTags('Admin Products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'شال نخی زنانه',
        },

        slug: {
          type: 'string',
          example: 'cotton-scarf',
        },

        description: {
          type: 'string',
        },

        price: {
          type: 'string',
          example: '350000',
        },

        salePrice: {
          type: 'string',
          example: '300000',
        },

        stock: {
          type: 'number',
          example: 20,
        },

        sku: {
          type: 'string',
          example: 'SKU-1001',
        },

        categoryId: {
          type: 'number',
          example: 1,
        },

        status: {
          type: 'string',
          example: 'ACTIVE',
        },

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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('images', 10, multerOptions(UploadFolders.PRODUCTS)),
  )
  create(
    @Body() body: CreateProductDto,

    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    return this.adminProductsService.create(body, files);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.adminProductsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.adminProductsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.adminProductsService.remove(id);
  }
}
