import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { ProductStatus, Prisma } from '@prisma/client';
import { ProductQueryDto, ProductSort } from '../dtos/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort = ProductSort.NEWEST,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice) {
        where.price.gte = minPrice.toString();
      }

      if (maxPrice) {
        where.price.lte = maxPrice.toString();
      }
    }

    if (inStock) {
      where.stock = {
        gt: 0,
      };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};

    switch (sort) {
      case ProductSort.NEWEST:
        orderBy.createdAt = 'desc';
        break;

      case ProductSort.OLDEST:
        orderBy.createdAt = 'asc';
        break;

      case ProductSort.PRICE_ASC:
        orderBy.price = 'asc';
        break;

      case ProductSort.PRICE_DESC:
        orderBy.price = 'desc';
        break;
    }

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,

        select: {
          id: true,

          title: true,
          slug: true,

          price: true,
          salePrice: true,

          stock: true,

          createdAt: true,

          category: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },

          images: {
            where: {
              isMain: true,
            },

            select: {
              imageUrl: true,
              alt: true,
            },

            take: 1,
          },
        },

        skip,
        take: limit,

        orderBy,
      }),

      this.prisma.product.count({
        where,
      }),
    ]);

    const data = products.map((product) => ({
      ...product,

      image: product.images.length > 0 ? product.images[0] : null,

      images: undefined,
    }));

    return {
      data,

      meta: {
        page,
        limit,

        total,

        totalPages: Math.ceil(total / limit),

        hasNext: page < Math.ceil(total / limit),

        hasPrev: page > 1,
      },
    };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
      },

      select: {
        id: true,

        title: true,
        slug: true,
        description: true,

        price: true,
        salePrice: true,

        stock: true,

        createdAt: true,
        updatedAt: true,

        category: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },

        images: {
          select: {
            id: true,
            imageUrl: true,
            alt: true,
            isMain: true,
            sortOrder: true,
          },

          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('محصول مورد نظر پیدا نشد.');
    }

    return product;
  }

  
  // ========================================================================================
  //                                    Private Helpers
  // ========================================================================================

  async getAvailableProduct(id: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        status: ProductStatus.ACTIVE,
      },

      select: {
        id: true,
        stock: true,
        status: true,
      },
    });

    if (!product) {
      throw new NotFoundException('محصول پیدا نشد.');
    }

    return product;
  }

  validateStock(stock: number, quantity: number) {
    if (stock === 0) {
      throw new BadRequestException('محصول ناموجود است.');
    }

    if (quantity > stock) {
      throw new BadRequestException('تعداد درخواستی بیشتر از موجودی است.');
    }
  }
}
