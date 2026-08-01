import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
  } from '@nestjs/common';
  import { ApiBearerAuth } from '@nestjs/swagger';
  
  import { OrdersService } from '../services/orders.service';
  
  import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
  import { RolesGuard } from 'src/common/guards/roles.guard';
  
  import { Roles } from 'src/common/decorators/roles.decorator';
  import { CurrentUser } from 'src/common/decorators/current-user.decorator';
  
  import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
  
  import { CreateOrderDto } from '../dtos/create-order.dto';
  import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
  
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Controller('orders')
  export class OrdersController {
    constructor(
      private readonly ordersService: OrdersService,
    ) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
      @CurrentUser() user: JwtPayload,
      @Body() body: CreateOrderDto,
    ) {
      return this.ordersService.create(user.sub, body);
    }
  
    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(
      @CurrentUser() user: JwtPayload,
    ) {
      return this.ordersService.findAll(user.sub);
    }
  
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(
      @CurrentUser() user: JwtPayload,
      @Param('id', ParseIntPipe) id: number,
    ) {
      return this.ordersService.findOne(user.sub, id);
    }
  }