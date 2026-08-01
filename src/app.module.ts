import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { UploadModule } from './common/upload/upload.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    ProfileModule,
    CategoriesModule,
    ProductsModule,
    UploadModule,
    CartModule,
    OrdersModule,
  ],

  controllers: [AppController],

  providers: [
    AppService, 
  ],
})
export class AppModule {}
