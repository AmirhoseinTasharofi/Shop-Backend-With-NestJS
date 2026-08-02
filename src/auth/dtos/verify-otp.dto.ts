import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';
import { IsIranianPhone } from 'src/common/validators/is-iranian-phone.validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: '09123456789',
  })
  @IsIranianPhone()
  phone: string;

  @ApiProperty({
    example: '',
  })
  @IsNumberString(
    {},
    {
      message:
        'کد تایید فقط باید شامل عدد باشد.',
    },
  )
  @Length(6, 6, {
    message:
      'کد تایید باید ۶ رقم باشد.',
  })
  code: string;
}
