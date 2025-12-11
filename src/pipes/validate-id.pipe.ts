import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidateIdPipe implements PipeTransform {
  transform(value: any): string {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException('ID parameter cannot be empty');
    }
    return value;
  }
}
