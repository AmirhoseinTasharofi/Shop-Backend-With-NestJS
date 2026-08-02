import { ApiProperty } from '@nestjs/swagger';
import { IsIranianPhone } from 'src/common/validators/is-iranian-phone.validator';

export class SendOtpDto {
  @ApiProperty({
    example: '09123456789',
  })
  @IsIranianPhone()
  phone: string;
}
