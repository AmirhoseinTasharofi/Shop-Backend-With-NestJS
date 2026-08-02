import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsIranianPhone } from 'src/common/validators/is-iranian-phone.validator';

export class CreateUserDto {
  @ApiProperty({
    example: '09123456789',
  })
  @IsIranianPhone()
  @IsNotEmpty()
  phone: string;
  
}
