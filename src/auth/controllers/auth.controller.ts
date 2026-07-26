import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterDto } from '../dtos/register.dto';
import { PhoneNumberPipe } from 'src/common/pipes/phone-number.pipe';
import { LoginDto } from '../dtos/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body(PhoneNumberPipe) body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(PhoneNumberPipe) body: LoginDto) {
    return this.authService.login(body);
  }

}

export { Controller };
