import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    body: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const existSlug = await this.prisma.product.findUnique({
      where: {
        slug: body.slug,
      },
    });

    if (existSlug) {
      throw new ConflictException('اسلاگ قبلاً ثبت شده است.');
    }

    const existSku = await this.prisma.product.findUnique({
      where: {
        sku: body.sku,
      },
    });

    if (existSku) {
      throw new ConflictException('SKU قبلاً ثبت شده است.');
    }

    if (body.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: body.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('دسته‌بندی پیدا نشد.');
      }
    }

    if (body.salePrice && Number(body.salePrice) >= Number(body.price)) {
      throw new BadRequestException('قیمت تخفیف باید کمتر از قیمت اصلی باشد.');
    }

    return this.prisma.product.create({
      data: body,
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
          category:true,
          images:true,
    }});

    if (!product) {
      throw new NotFoundException('محصول پیدا نشد.');
    }

    return product;
  }

  async update(id: number, body: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('محصول پیدا نشد.');
    }

    if (body.slug) {
      const existSlug = await this.prisma.product.findFirst({
        where: {
          slug: body.slug,
          NOT: {
            id,
          },
        },
      });

      if (existSlug) {
        throw new ConflictException('اسلاگ قبلاً ثبت شده است.');
      }
    }

    if (body.sku) {
      const existSku = await this.prisma.product.findFirst({
        where: {
          sku: body.sku,
          NOT: {
            id,
          },
        },
      });

      if (existSku) {
        throw new ConflictException('SKU قبلاً ثبت شده است.');
      }
    }

    if (body.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: body.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('دسته‌بندی پیدا نشد.');
      }
    }

    const price = body.price ?? product.price;
    const salePrice = body.salePrice ?? product.salePrice;

    if (salePrice && Number(salePrice) >= Number(price)) {
      throw new BadRequestException('قیمت تخفیف باید کمتر از قیمت اصلی باشد.');
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: body,
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
  
    if (!product) {
      throw new NotFoundException('محصول پیدا نشد.');
    }
  
    await this.prisma.product.delete({
      where: {
        id,
      },
    });
  
    return {
      message: 'محصول با موفقیت حذف شد.',
    };
  }
}
