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
    UseGuards,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { Role } from '@prisma/client';
  
  import { Roles } from 'src/common/decorators/roles.decorator';
  import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
  import { RolesGuard } from 'src/common/guards/roles.guard';
  
  import { AdminProductsService } from '../services/admin-products.service';
  import { CreateProductDto } from '../dtos/create-product.dto';
  import { UpdateProductDto } from '../dtos/update-product.dto';
  
  @ApiTags('Admin Products')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Controller('admin/products')
  export class AdminProductsController {
    constructor(
      private readonly adminProductsService: AdminProductsService,
    ) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
      @Body() body: CreateProductDto,
    ) {
      return this.adminProductsService.create(body);
    }
  
    @Get()
    @HttpCode(HttpStatus.OK)
    findAll() {
      return this.adminProductsService.findAll();
    }
  
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(
      @Param('id', ParseIntPipe) id: number,
    ) {
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
    remove(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.adminProductsService.remove(id);
    }
  }