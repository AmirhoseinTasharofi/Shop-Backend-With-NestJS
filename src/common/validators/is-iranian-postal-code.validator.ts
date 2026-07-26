import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  
  @ValidatorConstraint({ name: 'IsIranianPostalCode', async: false })
  export class IsIranianPostalCodeConstraint
    implements ValidatorConstraintInterface
  {
    validate(value: string): boolean {
      return /^\d{10}$/.test(value);
    }
  
    defaultMessage(args: ValidationArguments): string {
      return `${args.property} باید دقیقا ۱۰ رقم باشد.`;
    }
  }
  
  export function IsIranianPostalCode(
    validationOptions?: ValidationOptions,
  ) {
    return function (object: object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName,
        options: validationOptions,
        constraints: [],
        validator: IsIranianPostalCodeConstraint,
      });
    };
  }