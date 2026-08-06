import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { CreateProductDto } from './create-product.dto';

class ImageChangeDto {
  @ApiPropertyOptional({
    example: 12,
  })
  @IsInt()
  id: number;

  @ApiPropertyOptional({
    example: 0,
  })
  @IsInt()
  sortOrder: number;

  @ApiPropertyOptional({
    example: true,
  })
  @IsBoolean()
  isMain: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];

    const parsed = typeof value === 'string' ? JSON.parse(value) : value;

    return parsed.map(Number);
  })
  @IsArray()
  @IsInt({ each: true })
  deletedImageIds?: number[];

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @ValidateNested({ each: true })
  @Type(() => ImageChangeDto)
  imageChanges?: ImageChangeDto[];
}
