import { Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  async saveFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    const uploadPath = join(
      process.cwd(),
      'uploads',
      folder,
    );

    await mkdir(uploadPath, {
      recursive: true,
    });

    const fileName =
      randomUUID() + extname(file.originalname);

    const fullPath = join(
      uploadPath,
      fileName,
    );

    await writeFile(fullPath, file.buffer);

    return `uploads/${folder}/${fileName}`.replace(
      /\\/g,
      '/',
    );
  }

  async deleteFile(filePath: string) {
    const fullPath = join(
      process.cwd(),
      filePath,
    );

    try {
      await unlink(fullPath);
    } catch {
      // اگر فایل وجود نداشت
    }
  }

  async deleteFiles(urls: string[]) {
    await Promise.all(
      urls.map((url) => this.deleteFile(url)),
    );
  }

  getFileUrl(path: string) {
    return path.replace(/\\/g, '/');
  }
}