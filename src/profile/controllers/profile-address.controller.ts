import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ProfileAddressService } from '../services/profile-address.service';
import { CreateAddressDto } from '../dtos/create-address.dto';
import { UpdateAddressDto } from '../dtos/update-address.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileAddressController {
  constructor(private readonly profileAddressService: ProfileAddressService) {}

  @Get('addresses')
  @HttpCode(HttpStatus.OK)
  getAddresses(@CurrentUser() user: JwtPayload) {
    return this.profileAddressService.getAddresses(user.sub);
  }

  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  createAddress(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateAddressDto,
  ) {
    return this.profileAddressService.createAddress(user.sub, body);
  }

  @Patch('addresses/:id')
  @HttpCode(HttpStatus.OK)
  updateAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) addressId: number,
    @Body() body: UpdateAddressDto,
  ) {
    return this.profileAddressService.updateAddress(user.sub, addressId, body);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.OK)
  deleteAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.profileAddressService.deleteAddress(user.sub, addressId);
  }

  @Patch('addresses/:id/default')
  @HttpCode(HttpStatus.OK)
  setDefaultAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.profileAddressService.setDefaultAddress(user.sub, addressId);
  }
}
