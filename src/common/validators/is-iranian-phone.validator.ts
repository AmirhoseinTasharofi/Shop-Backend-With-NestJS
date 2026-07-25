import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
  } from 'class-validator';
  
  export function IsIranianPhone(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
      registerDecorator({
        name: 'isIranianPhone',
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: {
          validate(value: unknown): boolean {
            if (typeof value !== 'string') {
              return false;
            }
  
            return /^09\d{9}$/.test(value);
          },
  
          defaultMessage(args: ValidationArguments): string {
            return `${args.property} لطفا شماره موبایل را به درستی وارد کنید `;
          },
        },
      });
    };
  }