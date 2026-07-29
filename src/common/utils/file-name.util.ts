import { extname } from 'path';
import { randomUUID } from 'crypto';

export function generateFileName(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, filename: string) => void,
) {
  const extension = extname(file.originalname).toLowerCase();

  const filename = `${Date.now()}-${randomUUID()}${extension}`;

  callback(null, filename);
}