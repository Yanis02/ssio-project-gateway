import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({ example: 'permission-uuid-here', description: 'Permission ID to assign to the role' })
  @IsString()
  permissionId: string;
}
