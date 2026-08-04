import { memoryStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { imageFilter } from '../validators/image-filter.validator';

export const multerOptions = (): MulterOptions => ({
  storage: memoryStorage(),

  fileFilter: imageFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});