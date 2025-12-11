import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AccessControlService } from '../../services/access-control.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateRoleDto, CreatePermissionDto, AssignPermissionDto } from './dto';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Post()
  @ApiOperation({ summary: 'Create role', description: 'Create a new role in Keyrock' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @Req() req: any,
  ) {
    return this.accessControlService.createRole(createRoleDto.name, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all roles', description: 'Retrieve list of all roles' })
  @ApiResponse({ status: 200, description: 'Roles list retrieved' })
  async listRoles(@Req() req: any) {
    return this.accessControlService.listRoles(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID', description: 'Retrieve role information by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role information retrieved' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRole(
    @Param('id') roleId: string,
    @Req() req: any,
  ) {
    return this.accessControlService.getRole(roleId, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role', description: 'Update role information' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async updateRole(
    @Param('id') roleId: string,
    @Body() createRoleDto: CreateRoleDto,
    @Req() req: any,
  ) {
    return this.accessControlService.updateRole(roleId, createRoleDto.name, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete role', description: 'Delete role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async deleteRole(
    @Param('id') roleId: string,
    @Req() req: any,
  ) {
    await this.accessControlService.deleteRole(roleId, req.user.userId);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get role permissions', description: 'Retrieve permissions assigned to a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved' })
  async getRolePermissions(
    @Param('id') roleId: string,
    @Req() req: any,
  ) {
    return this.accessControlService.getRolePermissions(roleId, req.user.userId);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Assign permission to role', description: 'Assign a permission to a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Permission assigned successfully' })
  async assignPermission(
    @Param('id') roleId: string,
    @Body() assignPermissionDto: AssignPermissionDto,
    @Req() req: any,
  ) {
    await this.accessControlService.assignPermissionToRole(roleId, assignPermissionDto.permissionId, req.user.userId);
    return { message: 'Permission assigned successfully' };
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove permission from role', description: 'Remove a permission assignment from a role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiParam({ name: 'permissionId', description: 'Permission ID' })
  @ApiResponse({ status: 204, description: 'Permission removed successfully' })
  async removePermission(
    @Param('id') roleId: string,
    @Param('permissionId') permissionId: string,
    @Req() req: any,
  ) {
    await this.accessControlService.removePermissionFromRole(roleId, permissionId, req.user.userId);
  }
}

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Post()
  @ApiOperation({ summary: 'Create permission', description: 'Create a new permission in Keyrock' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
    @Req() req: any,
  ) {
    return this.accessControlService.createPermission(
      createPermissionDto,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all permissions', description: 'Retrieve list of all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions list retrieved' })
  async listPermissions(@Req() req: any) {
    return this.accessControlService.listPermissions(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID', description: 'Retrieve permission information by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission information retrieved' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async getPermission(
    @Param('id') permissionId: string,
    @Req() req: any,
  ) {
    return this.accessControlService.getPermission(permissionId, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update permission', description: 'Update permission information' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async updatePermission(
    @Param('id') permissionId: string,
    @Body() createPermissionDto: CreatePermissionDto,
    @Req() req: any,
  ) {
    return this.accessControlService.updatePermission(
      permissionId,
      createPermissionDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete permission', description: 'Delete permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async deletePermission(
    @Param('id') permissionId: string,
    @Req() req: any,
  ) {
    await this.accessControlService.deletePermission(permissionId, req.user.userId);
  }
}
