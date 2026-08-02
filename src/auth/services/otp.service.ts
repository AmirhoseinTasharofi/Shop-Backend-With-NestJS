import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async create(phone: string) {
    const code = this.generateCode();

    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await this.prisma.otp.deleteMany({
      where: {
        phone,
      },
    });

    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.otp.create({
      data: {
        phone,
        codeHash,
        expiresAt,
      },
    });

    return code;
  }

  async verify(phone: string, code: string): Promise<boolean> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        phone,
      },
    });

    if (!otp) {
      throw new BadRequestException('کد تاییدی برای این شماره یافت نشد.');
    }

    if (otp.expiresAt < new Date()) {
      await this.prisma.otp.delete({
        where: {
          id: otp.id,
        },
      });

      throw new UnauthorizedException('کد تایید منقضی شده است.');
    }

    const isValid = await bcrypt.compare(code, otp.codeHash);

    if (!isValid) {
      throw new UnauthorizedException('کد تایید نامعتبر است.');
    }

    await this.prisma.otp.delete({
      where: {
        id: otp.id,
      },
    });

    return true;
  }

  private generateCode(length = 6): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += randomInt(0, 10);
    }
    return code;
  }
}
