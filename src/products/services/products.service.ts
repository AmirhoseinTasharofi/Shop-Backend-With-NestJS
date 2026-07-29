import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return await this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
      },
      include: {
        category: true,
      },
    });
  
    if (!product) {
      throw new NotFoundException('محصول مورد نظر پیدا نشد.');
    }
  
    return product;
  }
}