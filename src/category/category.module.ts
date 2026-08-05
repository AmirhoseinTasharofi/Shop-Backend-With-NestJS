import { Module } from '@nestjs/common';
import { CategoryController } from './controllers/category.controller';
import { CategoryService } from './services/category.service';
import { AdminCategoryService } from './services/admin-category.service';
import { AdminCategoryController } from './controllers/admin-category.controller';
import { UploadModule } from 'src/common/upload/upload.module';

@Module({
  imports : [UploadModule],
  controllers: [CategoryController, AdminCategoryController],
  providers: [CategoryService, AdminCategoryService]
})
export class CategoryModule {}
