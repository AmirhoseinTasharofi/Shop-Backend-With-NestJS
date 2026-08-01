import {
    IsOptional,
    IsPostalCode,
    IsString,
    MaxLength,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  
  export class CreateOrderDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    receiverName: string;
  
    @ApiProperty()
    @IsString()
    receiverPhone: string;
  
    @ApiProperty()
    @IsString()
    province: string;
  
    @ApiProperty()
    @IsString()
    city: string;
  
    @ApiProperty()
    @IsString()
    streetAddress: string;
  
    @ApiProperty()
    @IsPostalCode('IR')
    postalCode: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    plaque?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    unit?: string;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    couponCode?: string;
  }