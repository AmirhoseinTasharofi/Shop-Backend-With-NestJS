import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from '../dtos/add-to-cart.dto';
import { UpdateCartItemDto } from '../dtos/update-cart-item.dto';
import { Prisma } from '@prisma/client';
import { ProductsService } from 'src/products/services/products.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductsService,
  ) {}

  async create(userId: number, tx: Prisma.TransactionClient = this.prisma) {
    return tx.cart.create({
      data: {
        userId,
      },
    });
  }

  async get(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },

      select: {
        id: true,

        items: {
          select: {
            quantity: true,

            product: {
              select: {
                id: true,
                title: true,
                slug: true,

                price: true,
                salePrice: true,

                stock: true,

                images: {
                  where: {
                    isMain: true,
                  },

                  select: {
                    imageUrl: true,
                  },

                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('سبد خرید پیدا نشد.');
    }

    return {
      id: cart.id,

      items: cart.items.map((item) => ({
        productId: item.product.id,

        title: item.product.title,
        slug: item.product.slug,

        price: item.product.price,
        salePrice: item.product.salePrice,

        stock: item.product.stock,

        quantity: item.quantity,

        mainImage: item.product.images[0]?.imageUrl ?? null,
      })),
    };
  }

  async add(userId: number, dto: AddToCartDto) {
    const product = await this.productService.getAvailableProduct(
      dto.productId,
    );

    this.productService.validateStock(product.stock, dto.quantity);

    const cart = await this.getCartOrThrow(userId);

    const cartItem = await this.getCartItem(cart.id, dto.productId);

    if (cartItem) {
      const newQuantity = cartItem.quantity + dto.quantity;

      this.productService.validateStock(product.stock, newQuantity);

      return this.updateCartItem(cartItem.id, newQuantity);
    }

    return this.createCartItem(cart.id, dto.productId, dto.quantity);
  }

  async update(userId: number, productId: number, dto: UpdateCartItemDto) {
    const cart = await this.getCartOrThrow(userId);

    const product = await this.productService.getAvailableProduct(productId);

    this.productService.validateStock(product.stock, dto.quantity);

    const cartItem = await this.getCartItem(cart.id, productId);

    if (!cartItem) {
      throw new NotFoundException('محصول در سبد خرید پیدا نشد.');
    }

    return this.updateCartItem(cartItem.id, dto.quantity);
  }

  async remove(userId: number, productId: number) {
    const cart = await this.getCartOrThrow(userId);

    const cartItem = await this.getCartItem(cart.id, productId);

    if (!cartItem) {
      throw new NotFoundException('محصول در سبد خرید پیدا نشد.');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    return {
      message: 'محصول از سبد حذف شد.',
    };
  }

  async clear(userId: number) {
    const cart = await this.getCartOrThrow(userId);

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {
      message: 'سبد خرید خالی شد.',
    };
  }

  // ========================================================================================
  //                                    Private Helpers
  // ========================================================================================

  private async getCartOrThrow(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
    });

    if (!cart) {
      throw new NotFoundException('سبد خرید پیدا نشد.');
    }

    return cart;
  }

  private async getCartItem(cartId: number, productId: number) {
    return this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  }

  private async createCartItem(
    cartId: number,
    productId: number,
    quantity: number,
  ) {
    return this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
      },
    });
  }

  private async updateCartItem(id: number, quantity: number) {
    return this.prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
    });
  }
}
