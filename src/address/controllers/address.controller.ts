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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressService } from '../services/address.service';
import { CreateAddressDto } from '../../address/dtos/create-address.dto';
import { UpdateAddressDto } from '../../address/dtos/update-address.dto';

@ApiTags('Address')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly AddressService: AddressService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  get(@CurrentUser() user: JwtPayload) {
    return this.AddressService.get(user.sub);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() body: CreateAddressDto) {
    return this.AddressService.create(user.sub, body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) addressId: number,
    @Body() body: UpdateAddressDto,
  ) {
    return this.AddressService.update(user.sub, addressId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.AddressService.delete(user.sub, addressId);
  }

  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  setDefault(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) addressId: number,
  ) {
    return this.AddressService.setDefault(user.sub, addressId);
  }
}
