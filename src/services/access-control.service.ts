import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeyrockRoleService } from '../fiware/keyrock/services/role.service';
import { KeyrockPermissionService } from '../fiware/keyrock/services/permission.service';
import { SessionService } from './session.service';

@Injectable()
export class AccessControlService {
  private readonly appId: string;

  constructor(
    private readonly keyrockRoleService: KeyrockRoleService,
    private readonly keyrockPermissionService: KeyrockPermissionService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('KEYROCK_APP_ID') || '';
    if (!this.appId) {
      throw new Error('KEYROCK_APP_ID environment variable is required');
    }
  }

  private getManagementToken(currentUserId: string): string {
    const session = this.sessionService.getSession(currentUserId);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    return session.keyrockManagementToken;
  }

  async createRole(name: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockRoleService.createRole(this.appId, { name }, token);
  }

  async getRole(roleId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockRoleService.getRole(this.appId, roleId, token);
  }

  async listRoles(currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockRoleService.listRoles(this.appId, token);
  }

  async updateRole(roleId: string, name: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockRoleService.updateRole(this.appId, roleId, { name }, token);
  }

  async deleteRole(roleId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockRoleService.deleteRole(this.appId, roleId, token);
  }

  async getRolePermissions(roleId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockPermissionService.listRolePermissions(this.appId, roleId, token);
  }

  async createPermission(
    data: { name: string; action: string; resource: string; description?: string },
    currentUserId: string,
  ) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockPermissionService.createPermission(
      this.appId,
      {
        name: data.name,
        action: data.action as any,
        resource: data.resource,
        description: data.description,
      },
      token,
    );
  }

  async getPermission(permissionId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockPermissionService.getPermission(this.appId, permissionId, token);
  }

  async listPermissions(currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockPermissionService.listPermissions(this.appId, token);
  }

  async updatePermission(
    permissionId: string,
    data: { name: string; action: string; resource: string; description?: string },
    currentUserId: string,
  ) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockPermissionService.updatePermission(
      this.appId,
      permissionId,
      {
        name: data.name,
        action: data.action as any,
        resource: data.resource,
        description: data.description,
      },
      token,
    );
  }

  async deletePermission(permissionId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockPermissionService.deletePermission(this.appId, permissionId, token);
  }

  async assignPermissionToRole(roleId: string, permissionId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockPermissionService.assignPermissionToRole(
      this.appId,
      roleId,
      { permission_id: permissionId },
      token,
    );
  }

  async removePermissionFromRole(roleId: string, permissionId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockPermissionService.removePermissionFromRole(this.appId, roleId, permissionId, token);
  }
}
