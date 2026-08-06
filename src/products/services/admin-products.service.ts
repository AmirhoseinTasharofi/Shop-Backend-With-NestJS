import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { UploadService } from 'src/common/upload/upload.service';
import { UploadFolders } from 'src/common/upload/upload.constants';
import { Prisma } from '@prisma/client';
import { SYSTEM_CATEGORY } from 'src/common/constants/system-category.constants';
import { AdminProductQueryDto, AdminProductSort } from '../dtos/admin-product-query.dto';

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },

      select: {
        id: true,

        title: true,
        slug: true,
        description: true,

        price: true,
        salePrice: true,

        stock: true,

        status: true,

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
      throw new NotFoundException('محصول پیدا نشد.');
    }

    return product;
  }

  async findAll(query: AdminProductQueryDto) {
    const {
      page,
      limit,
      search,
      categoryId,
      status,
      sort,
    } = query;
  
    const skip = (page - 1) * limit;
  
    const where: Prisma.ProductWhereInput = {};
  
    if (status) {
      where.status = status;
    }
  
    if (categoryId) {
      where.categoryId = categoryId;
    }
  
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }
  
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
  
    switch (sort) {
      case AdminProductSort.NEWEST:
        orderBy.createdAt = 'desc';
        break;
  
      case AdminProductSort.OLDEST:
        orderBy.createdAt = 'asc';
        break;
  
      case AdminProductSort.PRICE_ASC:
        orderBy.price = 'asc';
        break;
  
      case AdminProductSort.PRICE_DESC:
        orderBy.price = 'desc';
        break;
  
      case AdminProductSort.STOCK_ASC:
        orderBy.stock = 'asc';
        break;
  
      case AdminProductSort.STOCK_DESC:
        orderBy.stock = 'desc';
        break;
    }
  
    const [products, total] =
      await this.prisma.$transaction([
        this.prisma.product.findMany({
          where,
  
          skip,
          take: limit,
  
          orderBy,
  
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            salePrice: true,
            stock: true,
            status: true,
            createdAt: true,
  
            category: {
              select: {
                id: true,
                title: true,
              },
            },
  
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
        }),
  
        this.prisma.product.count({
          where,
        }),
      ]);
  
    return {
      data: products.map((product) => ({
        ...product,
        mainImage:
          product.images[0]?.imageUrl ?? null,
        images: undefined,
      })),
  
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext:
          page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async create(body: CreateProductDto, files?: Express.Multer.File[]) {
    await this.validateUniqueSlug(body.slug);

    const category = await this.getCategory(body.categoryId);

    this.validateSalePrice(body.price, body.salePrice);

    let imageUrls: string[] = [];

    try {
      if (files?.length) {
        imageUrls = await Promise.all(
          files.map((file) =>
            this.uploadService.saveFile(file, UploadFolders.PRODUCTS),
          ),
        );
      }

      const data: Prisma.ProductCreateInput = {
        title: body.title,
        slug: body.slug,
        description: body.description,

        price: body.price,
        salePrice: body.salePrice,

        stock: body.stock,

        status: body.status,

        category: {
          connect: {
            id: category.id,
          },
        },

        images: {
          create: imageUrls.map((url, index) => ({
            imageUrl: url,
            isMain: index === 0,
            sortOrder: index,
          })),
        },
      };

      return await this.prisma.product.create({
        data,
        include: {
          category: true,
          images: true,
        },
      });
    } catch (error) {
      if (imageUrls.length > 0) {
        await this.uploadService.deleteFiles(imageUrls);
      }

      throw error;
    }
  }

  async update(
    id: number,
    body: UpdateProductDto,
    files?: Express.Multer.File[],
  ) {
    
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('محصول پیدا نشد.');
    }

    if (body.slug) {
      await this.validateUniqueSlug(body.slug, id);
    }

    const category = await this.getCategory(body.categoryId);

    const price = body.price ?? product.price;
    const salePrice = body.salePrice ?? product.salePrice;
    this.validateSalePrice(price.toString(), salePrice?.toString());

    let uploadedImageUrls: string[] = [];

    try {
      if (files?.length) {
        uploadedImageUrls = await Promise.all(
          files.map((file) =>
            this.uploadService.saveFile(file, UploadFolders.PRODUCTS),
          ),
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: {
            id,
          },

          data: {
            title: body.title,
            slug: body.slug,
            description: body.description,

            price: body.price,
            salePrice: body.salePrice,

            stock: body.stock,

            categoryId: body.categoryId,

            status: body.status,
          },
        });

        if (body.deletedImageIds?.length) {
          await tx.productImage.deleteMany({
            where: {
              id: {
                in: body.deletedImageIds,
              },

              productId: id,
            },
          });
        }

        if (body.imageChanges?.length) {
          await Promise.all(
            body.imageChanges.map((image) =>
              tx.productImage.update({
                where: {
                  id: image.id,
                },

                data: {
                  sortOrder: image.sortOrder,

                  isMain: image.isMain,
                },
              }),
            ),
          );
        }

        if (uploadedImageUrls.length) {
          await tx.productImage.createMany({
            data: uploadedImageUrls.map((url, index) => ({
              productId: id,

              imageUrl: url,

              sortOrder: product.images.length + index,

              isMain: false,
            })),
          });
        }

        const images = await tx.productImage.findMany({
          where: {
            productId: id,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        });

        if (images.length > 0) {
          const mainImages = images.filter((image) => image.isMain);

          if (mainImages.length === 0) {
            await tx.productImage.update({
              where: {
                id: images[0].id,
              },
              data: {
                isMain: true,
              },
            });
          } else if (mainImages.length > 1) {
            await tx.productImage.updateMany({
              where: {
                productId: id,
              },
              data: {
                isMain: false,
              },
            });

            await tx.productImage.update({
              where: {
                id: mainImages[0].id,
              },
              data: {
                isMain: true,
              },
            });
          }
        }

        return await tx.product.findUnique({
          where: {
            id,
          },
        
          select: {
            id: true,
        
            title: true,
            slug: true,
            description: true,
        
            price: true,
            salePrice: true,
        
            stock: true,
        
            status: true,
        
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
      });

      if (body.deletedImageIds?.length) {
        const deletedImages = product.images.filter((image) =>
          body.deletedImageIds!.includes(image.id),
        );

        await this.uploadService.deleteFiles(
          deletedImages.map((image) => image.imageUrl),
        );
      }

      return result;
    } catch (error) {
      if (uploadedImageUrls.length) {
        await this.uploadService.deleteFiles(uploadedImageUrls);
      }

      throw error;
    }
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

  // ========================================================================================
  //                                    Private Helpers
  // ========================================================================================

  private async validateUniqueSlug(slug: string, ignoreId?: number) {
    const existSlug = await this.prisma.product.findFirst({
      where: {
        slug,
        ...(ignoreId && {
          NOT: {
            id: ignoreId,
          },
        }),
      },
    });

    if (existSlug) {
      throw new ConflictException('اسلاگ قبلاً ثبت شده است.');
    }
  }

  private async getCategory(categoryId?: number) {
    let category;

    if (categoryId) {
      category = await this.prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('دسته‌بندی پیدا نشد.');
      }
    } else {
      category = await this.prisma.category.findUnique({
        where: {
          slug: SYSTEM_CATEGORY.SLUG,
        },
      });

      if (!category) {
        throw new InternalServerErrorException('دسته‌بندی سیستمی پیدا نشد.');
      }
    }

    return category;
  }

  private validateSalePrice(price: string, salePrice?: string) {
    if (salePrice && Number(salePrice) >= Number(price)) {
      throw new BadRequestException('قیمت تخفیف باید کمتر از قیمت اصلی باشد.');
    }
  }
}
