import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin', description: 'Role name (minimum 3 characters)', minLength: 3 })
  @IsString()
  @MinLength(3, { message: 'Role name must be at least 3 characters long' })
  name: string;
}
