import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { CartModule } from 'src/cart/cart.module';


@Module({
  imports : [CartModule],
  controllers: [UserController],
  providers: [UserService],
  exports : [UserService],
})
export class UserModule {}
