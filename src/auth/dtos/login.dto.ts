import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '09123456789',
  })
  @IsNotEmpty()
  phone: string;
  //======================

  @ApiProperty({
    example: 'password1234',
  })
  @IsString()
  password: string;
}