import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dtos/register.dto';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}


  

  async register(body: RegisterDto) {
    const existUser = await this.prismaService.user.findUnique({
      where: {
        phone: body.phone,
      },
    });
    if (existUser) {
      throw new ConflictException('این شماره موبایل قبلا ثبت شده است');
    }

    const hashedPassword = await this.passwordService.hash(body.password);

    const user = await this.prismaService.user.create({
      data: {
        phone: body.phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        phone: true,
        createdAt: true,
      },
    });

    return {
      massage: 'ثبت نام با موفقیت انجام شد',
      user,
    };
  }

  async login(body: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        phone: body.phone,
      },
    });

    if (!user) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است.');
    }

    const isPasswordCorrect = await this.passwordService.compare(
      body.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است.');
    }

    const accessToken = this.generateAccessToken(user);

    return {
      accessToken,
    };
  }

  private generateAccessToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });
  }
}
