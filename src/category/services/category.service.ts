import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          orderBy: {
            title: 'asc',
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    });
  }

  async findOneBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug,
      },
      include: {
        children: {
          orderBy: {
            title: 'asc',
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی مورد نظر پیدا نشد.');
    }

    return category;
  }
}
