import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from '../../address/dtos/create-address.dto';
import { UpdateAddressDto } from '../../address/dtos/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prismaServise: PrismaService) {}

  async get(userId: number) {
    return this.prismaServise.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });
  }

  async findAll(){
    return this.prismaServise.address.findMany({
      orderBy: {
        isDefault: 'desc',
      },
    });
  }

  async create(userId: number, body: CreateAddressDto) {
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

  async update(
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

  async delete(userId: number, addressId: number) {
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

  async setDefault(userId: number, addressId: number) {
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
