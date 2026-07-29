import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { join } from 'path';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

import { generateFileName } from '../utils/file-name.util';
import { imageFilter } from '../validators/image-filter.validator';

export const multerOptions = (
  folder: string,
): MulterOptions => ({
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      const uploadPath = join(process.cwd(), 'uploads', folder);

      mkdirSync(uploadPath, { recursive: true });

      callback(null, uploadPath);
    },

    filename: generateFileName,
  }),

  fileFilter: imageFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});