import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsPostalCode,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsIranianPostalCode } from 'src/common/validators/is-iranian-postal-code.validator';

export class CreateAddressDto {
  @ApiProperty({
    example: 'تهران',
  })
  @IsString()
  @MaxLength(100)
  province: string;

  @ApiProperty({
    example: 'تهران',
  })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    example: 'خیابان آزادی، کوچه ۱۲، پلاک ۸',
  })
  @IsString()
  @MaxLength(500)
  streetAddress: string;

  @ApiProperty({
    example: '1234567890',
  })
  @IsIranianPostalCode()
  postalCode: string;

  @ApiPropertyOptional({
    example: '25',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  plaque?: string;

  @ApiPropertyOptional({
    example: '3',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
