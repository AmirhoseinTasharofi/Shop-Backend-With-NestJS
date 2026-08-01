import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { PaymentGateway, Prisma, ProductStatus } from '@prisma/client';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma : PrismaService,
    ){}

    async create(userId: number, dto: CreateOrderDto) {
        const cart = await this.prisma.cart.findUnique({
          where: {
            userId,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      
        if (!cart) {
          throw new NotFoundException('سبد خرید پیدا نشد.');
        }
      
        if (cart.items.length === 0) {
          throw new BadRequestException('سبد خرید خالی است.');
        }
      
        let totalPrice = new Prisma.Decimal(0);
      
        for (const item of cart.items) {
          if (item.product.status !== ProductStatus.ACTIVE) {
            throw new BadRequestException(
              `${item.product.title} قابل سفارش نیست.`,
            );
          }
      
          if (item.product.stock < item.quantity) {
            throw new BadRequestException(
              `موجودی ${item.product.title} کافی نیست.`,
            );
          }
      
          totalPrice = totalPrice.plus(
            item.product.price.mul(item.quantity),
          );
        }
      
        const discount = new Prisma.Decimal(0);
        const shippingCost = new Prisma.Decimal(0);
      
        const finalPrice = totalPrice
          .minus(discount)
          .plus(shippingCost);
      
        return this.prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              userId,
      
              receiverName: dto.receiverName,
              receiverPhone: dto.receiverPhone,
      
              province: dto.province,
              city: dto.city,
      
              streetAddress: dto.streetAddress,
      
              postalCode: dto.postalCode,
      
              plaque: dto.plaque,
              unit: dto.unit,
      
              totalPrice,
              discount,
              shippingCost,
              finalPrice,
      
              status: OrderStatus.PENDING,
            },
          });
      
          await tx.orderItem.createMany({
            data: cart.items.map((item) => ({
              orderId: order.id,
      
              productId: item.productId,
      
              productTitle: item.product.title,
      
              productPrice: item.product.price,
      
              quantity: item.quantity,
            })),
          });
      
          await tx.payment.create({
            data: {
              orderId: order.id,
      
              amount: finalPrice,
      
              gateway: PaymentGateway.ZARINPAL,
      
              status: PaymentStatus.PENDING,
            },
          });
      
          for (const item of cart.items) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
      
          await tx.cartItem.deleteMany({
            where: {
              cartId: cart.id,
            },
          });
      
          return order;
        });
      }

      async findAll(userId: number) {
        return this.prisma.order.findMany({
          where: {
            userId,
          },
          include: {
            items: true,
            payment: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
      
      async findOne(userId: number, orderId: number) {
        const order = await this.prisma.order.findFirst({
          where: {
            id: orderId,
            userId,
          },
          include: {
            items: true,
            payment: true,
          },
        });
      
        if (!order) {
          throw new NotFoundException('سفارش پیدا نشد.');
        }
      
        return order;
      }
      
      async findAllAdmin() {
        return this.prisma.order.findMany({
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            payment: true,
            items: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
      
      async findOneAdmin(orderId: number) {
        const order = await this.prisma.order.findUnique({
          where: {
            id: orderId,
          },
          include: {
            user: true,
            payment: true,
            items: true,
          },
        });
      
        if (!order) {
          throw new NotFoundException('سفارش پیدا نشد.');
        }
      
        return order;
      }
      
      async updateStatus(
        orderId: number,
        dto: UpdateOrderStatusDto,
      ) {
        const order = await this.prisma.order.findUnique({
          where: {
            id: orderId,
          },
        });
      
        if (!order) {
          throw new NotFoundException('سفارش پیدا نشد.');
        }
      
        return this.prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            status: dto.status,
          },
        });
      }
}
