import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../dtos/create-address.dto';
import { UpdateAddressDto } from '../dtos/update-address.dto';

@Injectable()
export class ProfileAddressService {
  constructor(private readonly prismaServise: PrismaService) {}


  async getAddresses(
    userId: number
) {
    return this.prismaServise.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });
  }

  async createAddress(
    userId: number, 
    body: CreateAddressDto
) {
    if (body.isDefault) {
      await this.prismaServise.address.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prismaServise.address.create({
      data: {
        userId,
        ...body,
      },
    });
  }

  async updateAddress(
    userId: number,
    addressId: number,
    body: UpdateAddressDto,
  ) {
    const address = await this.prismaServise.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('آدرس پیدا نشد');
    }

    if (body.isDefault) {
      await this.prismaServise.address.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prismaServise.address.update({
      where: {
        id: addressId,
      },
      data: body,
    });
  }

  async deleteAddress(
    userId: number, 
    addressId: number
) {
    const address = await this.prismaServise.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('آدرس پیدا نشد');
    }

    await this.prismaServise.address.delete({
      where: {
        id: addressId,
      },
    });

    return {
      message: 'آدرس با موفقیت حذف شد',
    };
  }

  async setDefaultAddress(
    userId: number, 
    addressId: number
) {
    const address = await this.prismaServise.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      throw new NotFoundException('آدرس پیدا نشد');
    }

    await this.prismaServise.$transaction([
      this.prismaServise.address.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      }),

      this.prismaServise.address.update({
        where: {
          id: addressId,
        },
        data: {
          isDefault: true,
        },
      }),
    ]);

    return {
      message: 'آدرس پیش‌فرض با موفقیت تغییر کرد',
    };
  }
}
