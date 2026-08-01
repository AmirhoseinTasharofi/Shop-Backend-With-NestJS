import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PaymentCallbackDto {
  @ApiProperty()
  @IsString()
  Authority: string;

  @ApiProperty()
  @IsString()
  Status: string;
}