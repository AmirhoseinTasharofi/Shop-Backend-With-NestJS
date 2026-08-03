import { Module } from '@nestjs/common';
import { AddressService } from './services/address.service';
import { AddressController } from './controllers/address.controller';

@Module({
  providers: [AddressService],
  controllers: [AddressController]
})
export class AddressModule {}
