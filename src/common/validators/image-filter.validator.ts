import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export function imageFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: Function,
) {
  if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
    return callback(
      new BadRequestException(
        'فقط فایل‌های تصویری jpg، png و webp مجاز هستند',
      ),
      false,
    );
  }

  callback(null, true);
}