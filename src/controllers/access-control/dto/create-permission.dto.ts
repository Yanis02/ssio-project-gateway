import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Read Users', description: 'Permission name', minLength: 3 })
  @IsString()
  @MinLength(3, { message: 'Permission name must be at least 3 characters long' })
  name: string;

  @ApiProperty({ example: 'GET', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], description: 'HTTP method' })
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], { message: 'Action must be one of: GET, POST, PUT, PATCH, DELETE' })
  action: string;

  @ApiProperty({ example: '/api/users', description: 'Resource path or pattern' })
  @IsString()
  @MinLength(1, { message: 'Resource must not be empty' })
  resource: string;

  @ApiProperty({ example: 'Allows reading user information', description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
