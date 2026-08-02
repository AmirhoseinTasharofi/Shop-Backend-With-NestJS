import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsIranianPhone } from 'src/common/validators/is-iranian-phone.validator';

export class UpdateUserDto {
  
  @ApiPropertyOptional({
    example: '09123456789',
  })
  @IsOptional()
  @IsIranianPhone()
  phone?: string;

  @ApiPropertyOptional({
    example: 'firstname',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'lastname',

  })
  @IsOptional()
  @IsString()
  lastName?: string;
}
