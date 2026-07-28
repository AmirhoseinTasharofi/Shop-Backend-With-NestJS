import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }

    return category;
  }

  async create(body: CreateCategoryDto) {
    // slug نباید تکراری باشد
    const existCategory = await this.prisma.category.findUnique({
      where: {
        slug: body.slug,
      },
    });

    if (existCategory) {
      throw new ConflictException('دسته‌بندی با این اسلاگ قبلاً ثبت شده است.');
    }

    // اگر parentId ارسال شد، باید وجود داشته باشد
    if (body.parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: {
          id: body.parentId,
        },
      });

      if (!parentCategory) {
        throw new NotFoundException('دسته‌بندی والد پیدا نشد.');
      }
    }

    return await this.prisma.category.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        imageUrl: body.imageUrl,
        parentId: body.parentId,
      },
    });
  }

  async update(id: number, body: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }

    if (body.slug) {
      const existSlug = await this.prisma.category.findFirst({
        where: {
          slug: body.slug,
          NOT: {
            id,
          },
        },
      });

      if (existSlug) {
        throw new ConflictException('این اسلاگ قبلاً ثبت شده است.');
      }
    }

    if (body.parentId) {
      if (body.parentId === id) {
        throw new BadRequestException('دسته نمی‌تواند والد خودش باشد.');
      }

      const parent = await this.prisma.category.findUnique({
        where: {
          id: body.parentId,
        },
      });

      if (!parent) {
        throw new NotFoundException('دسته‌بندی والد پیدا نشد.');
      }
    }

    return await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        imageUrl: body.imageUrl,
        parentId: body.parentId,
      },
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی پیدا نشد.');
    }

    const productsCount = await this.prisma.product.count({
      where: {
        categoryId: id,
      },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'این دسته‌بندی دارای محصول است. ابتدا محصولات را منتقل کنید.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // انتقال فرزندان به والد
      await tx.category.updateMany({
        where: {
          parentId: id,
        },
        data: {
          parentId: category.parentId,
        },
      });

      // حذف دسته
      await tx.category.delete({
        where: {
          id,
        },
      });
    });

    return {
      message: 'دسته‌بندی با موفقیت حذف شد.',
    };
  }
}
