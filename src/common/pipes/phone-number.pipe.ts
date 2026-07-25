import {
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { convertNumbers } from '../utils/convertNumber';

@Injectable()
export class PhoneNumberPipe implements PipeTransform {
  transform(value: any) {
    if (value.phone) {
      const englishPhone = convertNumbers(value.phone);
      return { ...value, phone: englishPhone };
    }

    return value;
  }
}
