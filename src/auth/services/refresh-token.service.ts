import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, refreshToken: string, expiresAt: Date) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    return this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findAllByUser(userId: number) {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
      },
    });
  }

  async verify(userId: number, refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
      },
    });

    for (const token of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, token.tokenHash);

      if (!isMatch) {
        continue;
      }

      if (token.expiresAt < new Date()) {
        await this.delete(token.id);

        throw new UnauthorizedException('Refresh Token expired.');
      }

      return token;
    }

    throw new UnauthorizedException('Refresh Token is invalid.');
  }

  async rotate(
    oldTokenId: number,
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ) {
    await this.prisma.refreshToken.delete({
      where: {
        id: oldTokenId,
      },
    });

    return this.create(userId, refreshToken, expiresAt);
  }

  async delete(id: number) {
    return this.prisma.refreshToken.delete({
      where: {
        id,
      },
    });
  }

  async deleteAll(userId: number) {
    return this.prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }
}
