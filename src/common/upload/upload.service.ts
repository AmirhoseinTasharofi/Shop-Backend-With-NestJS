import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadService {
  getFileUrl(file: Express.Multer.File): string {
    return file.path.replace(/\\/g, '/');
  }

  async deleteFile(filePath: string) {
    const fullPath = join(process.cwd(), filePath);

    try {
      await unlink(fullPath);
    } catch (error) {
      console.log('File delete error:', error.message);
    }
  }

  async deleteFiles(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.deleteFile(url)));
  }
}
