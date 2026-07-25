import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class HashPasswordPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}
