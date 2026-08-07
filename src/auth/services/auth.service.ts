import { Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { SendOtpDto } from '../dtos/send-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { UserService } from 'src/user/services/user.service';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { RefreshTokenService } from './refresh-token.service';
import type { Response } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly otpService: OtpService,
    private readonly smsService: SmsService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async sendOtp(body: SendOtpDto) {
    const { phone } = body;

    const code = await this.otpService.create(phone);

    await this.smsService.sendOtp(phone, code);

    return {
      message: 'کد تایید با موفقیت ارسال شد.',
    };
  }

  async verifyOtp(body: VerifyOtpDto, response: Response) {
    await this.otpService.verify(body.phone, body.code);

    let user = await this.userService.findByPhone(body.phone);

    if (!user) {
      user = await this.userService.create({ phone: body.phone });
    }

    const tokens = await this.issueTokens(user);

    await this.refreshTokenService.create(
      user.id,
      tokens.refreshToken,
      tokens.expiresAt,
    );

    this.setRefreshCookie(response, tokens.refreshToken, tokens.expiresAt);

    return {
      accessToken: tokens.accessToken,
    };
  }

  async refresh(refreshToken: string, response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found.');
    }
    const { user, oldToken } = await this.validateRefreshToken(refreshToken);

    const tokens = await this.issueTokens(user);

    await this.refreshTokenService.rotate(
      oldToken.id,
      user.id,
      tokens.refreshToken,
      tokens.expiresAt,
    );

    this.setRefreshCookie(response, tokens.refreshToken, tokens.expiresAt);

    return {
      accessToken: tokens.accessToken,
    };
  }

  async logout(refreshToken: string, response: Response) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
    });

    const token = await this.refreshTokenService.verify(
      payload.sub,
      refreshToken,
    );

    await this.refreshTokenService.delete(token.id);

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  // ========================================================================================
  //                                    Private Helpers
  // ========================================================================================

  private async validateRefreshToken(refreshToken: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const oldToken = await this.refreshTokenService.verify(
      payload.sub,
      refreshToken,
    );

    const user = await this.userService.findById(payload.sub);

    return {
      user,
      oldToken,
    };
  }

  private async issueTokens(user: User) {
    const accessToken = await this.generateAccessToken(user);

    const refreshToken = await this.generateRefreshToken(user);

    const expiresAt = new Date(
      Date.now() +
        ms(
          this.configService.getOrThrow(
            'REFRESH_TOKEN_EXPIRES_IN',
          ) as StringValue,
        ),
    );

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  private setRefreshCookie(
    response: Response,
    refreshToken: string,
    expiresAt: Date,
  ) {
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
    });
  }

  private async generateAccessToken(user: User) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        phone: user.phone,
        role: user.role,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT_EXPIRES_IN',
        ) as StringValue,
      },
    );
  }

  private async generateRefreshToken(user: User) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
      },
      {
        secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'REFRESH_TOKEN_EXPIRES_IN',
        ) as StringValue,
      },
    );
  }
}
