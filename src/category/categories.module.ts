import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';
import { AdminCategoriesService } from './services/admin-categories.service';
import { AdminCategoriesController } from './controllers/admin-categories.controller';

@Module({
  controllers: [CategoriesController, AdminCategoriesController],
  providers: [CategoriesService, AdminCategoriesService]
})
export class CategoriesModule {}
