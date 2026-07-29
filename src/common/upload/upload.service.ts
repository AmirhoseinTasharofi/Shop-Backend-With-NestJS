import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  async deleteFile(url: string): Promise<void> {
    try {
      const filePath = join(process.cwd(), url.replace(/^\//, ''));

      await fs.unlink(filePath);
    } catch {
      // فایل وجود نداشت
    }
  }

  async deleteFiles(urls: string[]): Promise<void> {
    await Promise.all(urls.map((url) => this.deleteFile(url)));
  }
}