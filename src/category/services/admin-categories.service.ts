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

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService , 
    private readonly uploadService : UploadService
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

  async create(body: CreateCategoryDto , file?: Express.Multer.File,) {
    const existCategory = await this.prisma.category.findUnique({
      where: {
        slug: body.slug,
      },
    });
    if (existCategory) {
      throw new ConflictException('دسته‌بندی با این اسلاگ قبلاً ثبت شده است.');
    }
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
        imageUrl: file
        ? `/uploads/categories/${file.filename}`
        : null,
        parentId: body.parentId,
      },
    });
  }

  async update(
    id: number,
    body: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
  
    if (!category) {
      throw new NotFoundException(
        'دسته‌بندی پیدا نشد.',
      );
    }
  
    // ... اعتبارسنجی‌های قبلی ...
  
    const oldImage = category.imageUrl;
  
    const updatedCategory =
      await this.prisma.category.update({
        where: {
          id,
        },
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description,
          parentId: body.parentId,
  
          ...(file && {
            imageUrl:
              this.uploadService.getFileUrl(file),
          }),
        },
      });
  
    if (file && oldImage) {
      await this.uploadService.deleteFile(
        oldImage,
      );
    }
  
    return updatedCategory;
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });
  
    if (!category) {
      throw new NotFoundException(
        'دسته‌بندی پیدا نشد.',
      );
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
      await tx.category.updateMany({
        where: {
          parentId: id,
        },
        data: {
          parentId: category.parentId,
        },
      });
  
      await tx.category.delete({
        where: {
          id,
        },
      });
    });
  
    if (category.imageUrl) {
      await this.uploadService.deleteFile(
        category.imageUrl,
      );
    }
  
    return {
      message: 'دسته‌بندی با موفقیت حذف شد.',
    };
  }
}
