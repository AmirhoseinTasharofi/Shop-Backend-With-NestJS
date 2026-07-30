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
  import { ApiBearerAuth } from '@nestjs/swagger';
  
  import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
  import { CurrentUser } from 'src/common/decorators/current-user.decorator';
  import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
  
  import { CartService } from '../services/cart.service';
  import { AddToCartDto } from '../dtos/add-to-cart.dto';
  import { UpdateCartItemDto } from '../dtos/update-cart-item.dto';
  import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER')
  @Controller('cart')
  export class CartController {
    constructor(
      private readonly cartService: CartService,
    ) {}
  
    @Get()
    @HttpCode(HttpStatus.OK)
    getCart(
      @CurrentUser() user: JwtPayload,
    ) {
      return this.cartService.getCart(user.sub);
    }
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    addToCart(
      @CurrentUser() user: JwtPayload,
      @Body() body: AddToCartDto,
    ) {
      return this.cartService.addToCart(user.sub, body);
    }
  
    @Patch(':productId')
    @HttpCode(HttpStatus.OK)
    updateQuantity(
      @CurrentUser() user: JwtPayload,
      @Param('productId', ParseIntPipe) productId: number,
      @Body() body: UpdateCartItemDto,
    ) {
      return this.cartService.updateQuantity(
        user.sub,
        productId,
        body,
      );
    }
  
    @Delete(':productId')
    @HttpCode(HttpStatus.OK)
    removeFromCart(
      @CurrentUser() user: JwtPayload,
      @Param('productId', ParseIntPipe) productId: number,
    ) {
      return this.cartService.removeFromCart(
        user.sub,
        productId,
      );
    }
  
    @Delete()
    @HttpCode(HttpStatus.OK)
    clearCart(
      @CurrentUser() user: JwtPayload,
    ) {
      return this.cartService.clearCart(user.sub);
    }
  }