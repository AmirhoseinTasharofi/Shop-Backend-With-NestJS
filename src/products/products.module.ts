import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { AdminProductsService } from './services/admin-products.service';
import { AdminProductsController } from './controllers/admin-products.controller';
import { UploadModule } from 'src/common/upload/upload.module';

@Module({
  imports: [UploadModule],
  providers: [ProductsService, AdminProductsService],
  controllers: [ProductsController, AdminProductsController],
})
export class ProductsModule {}
