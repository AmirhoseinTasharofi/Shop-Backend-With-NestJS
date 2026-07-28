import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PhoneNumberPipe } from 'src/common/pipes/phone-number.pipe';
import { UpdateProfileDto } from '../dtos/update-profile.dto';


@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  
  @Get('/')
  @HttpCode(HttpStatus.OK)
  getProfileInfo(@CurrentUser() user: JwtPayload) {
    return this.profileService.getProfileInfo(user.sub);
  }
  
  @Patch('/')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body(PhoneNumberPipe) body: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.sub, body);
  }


  // ===================== addresses route ==================================

  
}
