import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { UploadService } from 'src/common/upload/upload.service';

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(body: CreateProductDto, files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('حداقل یک تصویر برای محصول الزامی است.');
    }

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

    const productData = body;

    return this.prisma.product.create({
      data: {
        ...productData,

        images: {
          create: files.map((file, index) => ({
            imageUrl: `uploads/products/${file.filename}`,
            isMain: index === 0,

            sortOrder: index,
          })),
        },
      },

      include: {
        images: true,
      },
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
        category: true,
        images: true,
      },
    });

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

      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('محصول پیدا نشد.');
    }

    for (const image of product.images) {
      await this.uploadService.deleteFile(image.imageUrl);
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
