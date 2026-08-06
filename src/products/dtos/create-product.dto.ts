import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'شال نخی زنانه',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'women-cotton-scarf',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    example: 'توضیحات محصول...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '350000',
  })
  @IsDecimal()
  price: string;

  @ApiPropertyOptional({
    example: '300000',
  })
  @IsOptional()
  @IsDecimal()
  salePrice?: string;

  @ApiProperty({
    example: 50,
  })
  @IsInt()
  @Min(0)
  stock: number;
  
  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  categoryId?: number;

  @ApiPropertyOptional({
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

}