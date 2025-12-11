import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { AccessControlService } from '../../services/access-control.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Post()
  async createRole(
    @Body() body: { name: string },
    @Req() req: any,
  ) {
    return this.accessControlService.createRole(body.name, req.user.userId);
  }

  @Get()
  async listRoles(@Req() req: any) {
    return this.accessControlService.listRoles(req.user.userId);
  }

  @Get(':id')
  async getRole(
    @Param('id') roleId: string,
    @Req() req: any,
  ) {
    return this.accessControlService.getRole(roleId, req.user.userId);
  }

  @Put(':id')
  async updateRole(
    @Param('id') roleId: string,
    @Body() body: { name: string },
    @Req() req: any,
  ) {
    return this.accessControlService.updateRole(roleId, body.name, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(
    @Param('id') roleId: string,
    @Req() req: any,
  ) {
    await this.accessControlService.deleteRole(roleId, req.user.userId);
  }

  @Get(':id/permissions')
  async getRolePermissions(
    @Param('id') roleId: string,
    @Req() req: any,
  ) {
    return this.accessControlService.getRolePermissions(roleId, req.user.userId);
  }

  @Post(':id/permissions')
  async assignPermission(
    @Param('id') roleId: string,
    @Body() body: { permissionId: string },
    @Req() req: any,
  ) {
    await this.accessControlService.assignPermissionToRole(roleId, body.permissionId, req.user.userId);
    return { message: 'Permission assigned successfully' };
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePermission(
    @Param('id') roleId: string,
    @Param('permissionId') permissionId: string,
    @Req() req: any,
  ) {
    await this.accessControlService.removePermissionFromRole(roleId, permissionId, req.user.userId);
  }
}

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Post()
  async createPermission(
    @Body() body: { name: string; action: string; resource: string; description?: string },
    @Req() req: any,
  ) {
    return this.accessControlService.createPermission(
      {
        name: body.name,
        action: body.action,
        resource: body.resource,
        description: body.description,
      },
      req.user.userId,
    );
  }

  @Get()
  async listPermissions(@Req() req: any) {
    return this.accessControlService.listPermissions(req.user.userId);
  }

  @Get(':id')
  async getPermission(
    @Param('id') permissionId: string,
    @Req() req: any,
  ) {
    return this.accessControlService.getPermission(permissionId, req.user.userId);
  }

  @Put(':id')
  async updatePermission(
    @Param('id') permissionId: string,
    @Body() body: { name: string; action: string; resource: string; description?: string },
    @Req() req: any,
  ) {
    return this.accessControlService.updatePermission(
      permissionId,
      {
        name: body.name,
        action: body.action,
        resource: body.resource,
        description: body.description,
      },
      req.user.userId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePermission(
    @Param('id') permissionId: string,
    @Req() req: any,
  ) {
    await this.accessControlService.deletePermission(permissionId, req.user.userId);
  }
}
