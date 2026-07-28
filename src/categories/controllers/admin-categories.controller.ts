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
  
  import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
  import { RolesGuard } from 'src/common/guards/roles.guard';
  import { Roles } from 'src/common/decorators/roles.decorator';
  import { Role } from '@prisma/client';
  
  import { AdminCategoriesService } from '../services/admin-categories.service';
  import { CreateCategoryDto } from '../dtos/create-category.dto';
  import { UpdateCategoryDto } from '../dtos/update-category.dto';
  
  @ApiTags('Admin Categories')
  @ApiBearerAuth('access-token')
  @Controller('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  export class AdminCategoriesController {
    constructor(
      private readonly adminCategoriesService: AdminCategoriesService,
    ) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() body: CreateCategoryDto) {
      return this.adminCategoriesService.create(body);
    }
  
    @Get()
    @HttpCode(HttpStatus.OK)
    findAll() {
      return this.adminCategoriesService.findAll();
    }
  
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.adminCategoriesService.findOne(id);
    }
  
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() body: UpdateCategoryDto,
    ) {
      return this.adminCategoriesService.update(id, body);
    }
  
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.adminCategoriesService.remove(id);
    }
  }