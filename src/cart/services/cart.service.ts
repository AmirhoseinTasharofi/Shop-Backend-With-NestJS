import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { AddToCartDto } from '../dtos/add-to-cart.dto';
  import { UpdateCartItemDto } from '../dtos/update-cart-item.dto';
  
  @Injectable()
  export class CartService {
    constructor(private readonly prisma: PrismaService) {}
  
    async getCart(userId: number) {
      return this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: {
                      sortOrder: 'asc',
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
  
    async addToCart(userId: number, dto: AddToCartDto) {
      const product = await this.prisma.product.findFirst({
        where: {
          id: dto.productId,
          status: 'ACTIVE',
        },
      });
  
      if (!product) {
        throw new NotFoundException('محصول پیدا نشد.');
      }
  
      if (product.stock === 0) {
        throw new BadRequestException('محصول ناموجود است.');
      }
  
      if (dto.quantity > product.stock) {
        throw new BadRequestException('تعداد درخواستی بیشتر از موجودی است.');
      }
  
      let cart = await this.prisma.cart.findUnique({
        where: {
          userId,
        },
      });
  
      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId,
          },
        });
      }
  
      const cartItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: dto.productId,
          },
        },
      });
  
      if (cartItem) {
        const quantity = cartItem.quantity + dto.quantity;
  
        if (quantity > product.stock) {
          throw new BadRequestException(
            'تعداد درخواستی بیشتر از موجودی است.',
          );
        }
  
        return this.prisma.cartItem.update({
          where: {
            id: cartItem.id,
          },
          data: {
            quantity,
          },
        });
      }
  
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });
    }
  
    async updateQuantity(
      userId: number,
      productId: number,
      dto: UpdateCartItemDto,
    ) {
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
      });
  
      if (!cart) {
        throw new NotFoundException('سبد خرید پیدا نشد.');
      }
  
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
  
      if (!product) {
        throw new NotFoundException('محصول پیدا نشد.');
      }
  
      if (dto.quantity > product.stock) {
        throw new BadRequestException('تعداد بیشتر از موجودی است.');
      }
  
      return this.prisma.cartItem.update({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
        data: {
          quantity: dto.quantity,
        },
      });
    }
  
    async removeFromCart(userId: number, productId: number) {
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
      });
  
      if (!cart) {
        throw new NotFoundException('سبد خرید پیدا نشد.');
      }
  
      await this.prisma.cartItem.delete({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });
  
      return {
        message: 'محصول از سبد حذف شد.',
      };
    }
  
    async clearCart(userId: number) {
      const cart = await this.prisma.cart.findUnique({
        where: { userId },
      });
  
      if (!cart) {
        throw new NotFoundException('سبد خرید پیدا نشد.');
      }
  
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
  
      return {
        message: 'سبد خرید خالی شد.',
      };
    }
  }