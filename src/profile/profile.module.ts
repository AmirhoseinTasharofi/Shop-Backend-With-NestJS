import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { ProfileAddressService } from './services/profile-address.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileAddressService]
})
export class ProfileModule {}
