import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { UploadService } from 'src/common/upload/upload.service';
import { UploadFolders } from 'src/common/upload/upload.constants';

@Injectable()
export class AdminCategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

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

  async create(body: CreateCategoryDto, file?: Express.Multer.File) {
    let imageUrl: string | undefined;

    try {
      const existCategory = await this.prisma.category.findUnique({
        where: {
          slug: body.slug,
        },
      });

      if (existCategory) {
        throw new ConflictException(
          'دسته‌بندی با این اسلاگ قبلاً ثبت شده است.',
        );
      }

      if (body.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: {
            id: body.parentId,
          },
        });

        if (!parent) {
          throw new NotFoundException('دسته‌بندی والد پیدا نشد.');
        }
      }

      if (file) {
        imageUrl = await this.uploadService.saveFile(
          file,
          UploadFolders.CATEGORIES,
        );
      }

      return await this.prisma.category.create({
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description,
          parentId: body.parentId,
          imageUrl,
        },
      });
    } catch (error) {
      if (imageUrl) {
        await this.uploadService.deleteFile(imageUrl);
      }

      throw error;
    }
  }

  async update(
    id: number,
    body: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
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

    let newImageUrl: string | undefined;

    try {
      if (file) {
        newImageUrl = await this.uploadService.saveFile(
          file,
          UploadFolders.CATEGORIES,
        );
      }

      const updatedCategory = await this.prisma.category.update({
        where: {
          id,
        },
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description,
          parentId: body.parentId,

          ...(newImageUrl && {
            imageUrl: newImageUrl,
          }),
        },
      });

      if (newImageUrl && category.imageUrl) {
        await this.uploadService.deleteFile(category.imageUrl);
      }

      return updatedCategory;
    } catch (error) {
      if (newImageUrl) {
        await this.uploadService.deleteFile(newImageUrl);
      }

      throw error;
    }
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

    if (category.isSystem) {
      throw new BadRequestException('دسته‌بندی سیستمی قابل حذف نیست.');
    }

    await this.prisma.$transaction(async (tx) => {
      const uncategorized = await tx.category.findFirst({
        where: {
          isSystem: true,
        },
      });

      if (!uncategorized) {
        throw new NotFoundException('دسته‌بندی سیستمی پیدا نشد.');
      }

      const targetCategoryId = category.parentId ?? uncategorized.id;

      // انتقال محصولات
      await tx.product.updateMany({
        where: {
          categoryId: id,
        },
        data: {
          categoryId: targetCategoryId,
        },
      });

      // انتقال فرزندان
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

    if (category.imageUrl) {
      await this.uploadService.deleteFile(category.imageUrl);
    }

    return {
      message: 'دسته‌بندی با موفقیت حذف شد.',
    };
  }
}
