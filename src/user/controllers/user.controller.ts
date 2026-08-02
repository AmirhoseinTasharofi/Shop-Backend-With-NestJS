import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PhoneNumberPipe } from 'src/common/pipes/phone-number.pipe';
import { UpdateUserDto } from '../dtos/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  
  @Get()
  @HttpCode(HttpStatus.OK)
  get(@CurrentUser() user: JwtPayload) {
    return this.userService.get(user.sub);
  }
  
  @Patch()
  @HttpCode(HttpStatus.OK)
  update(
    @CurrentUser() user: JwtPayload,
    @Body(PhoneNumberPipe) body: UpdateUserDto,
  ) {
    return this.userService.update(user.sub, body);
  }
}
