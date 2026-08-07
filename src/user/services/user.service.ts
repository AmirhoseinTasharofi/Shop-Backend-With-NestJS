import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CreateUserDto } from '../dtos/create-user-dto';
import { CartService } from 'src/cart/services/cart.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService : CartService,
  ) {}

  async create(body: CreateUserDto) {
    const exists = await this.findByPhone(body.phone);
  
    if (exists) {
      throw new ConflictException(
        'این شماره موبایل قبلا ثبت شده است',
      );
    }
  
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: body.phone,
        },
      });
  
      if (user.role === Role.CUSTOMER) {
        await this.cartService.create(user.id , tx);
      }  
      return user;
    });
  }

  async get(userId: number) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  async update(userId: number, body: UpdateUserDto) {
    if (body.phone) {
      const existUser = await this.prisma.user.findUnique({
        where: {
          phone: body.phone,
        },
      });
      if (existUser?.id !== userId) {
        throw new ConflictException('این شماره موبایل قبلا ثبت شده است');
      }
    }
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phone: body.phone,
        firstName: body.firstName,
        lastName: body.lastName,
      },
      select: {
        id: true,
        phone: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  async findByPhone(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });
    return user;
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }
}
