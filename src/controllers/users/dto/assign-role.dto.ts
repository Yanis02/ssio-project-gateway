import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ example: 'role-uuid-here', description: 'Role ID to assign to the user' })
  @IsString()
  roleId: string;
}
