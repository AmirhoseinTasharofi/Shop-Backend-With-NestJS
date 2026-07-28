import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { ProfileAddressService } from './services/profile-address.service';
import { ProfileAddressController } from './controllers/profile-address.controller';

@Module({
  controllers: [ProfileController, ProfileAddressController],
  providers: [ProfileService, ProfileAddressService]
})
export class ProfileModule {}
