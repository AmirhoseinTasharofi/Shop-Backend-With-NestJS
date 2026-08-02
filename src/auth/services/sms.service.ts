import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(phone: string, code: string): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv === 'development') {
      this.logger.log(
        `[DEV] OTP for ${phone}: ${code}`,
      );
      return;
    }

    // TODO:
    // اتصال به سرویس پیامک
    // Kavenegar
    // Melipayamak
    // FarazSMS
  }
}