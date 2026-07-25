import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { IsIranianPhone } from 'src/common/validators/is-iranian-phone.validator';

export class RegisterDto {
  @ApiProperty({
    example: '09123456789',
  })
  @IsIranianPhone()
  @IsNotEmpty()
  phone: string;

  //======================

  @ApiProperty({
    example: 'password1234',
  })
  @IsString()
  @MinLength(6, {
    message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
  })
  @MaxLength(12, {
    message: 'رمز عبور نباید بیشتر از ۱۲ کاراکتر باشد.',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, {
    message: 'رمز عبور باید شامل حداقل یک حرف و یک عدد باشد.',
  })
  password: string;
}