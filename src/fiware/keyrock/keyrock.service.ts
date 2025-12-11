import { Injectable } from '@nestjs/common';
import { KeyrockAuthService } from './services/auth.service';
import { KeyrockUserService } from './services/user.service';
import { KeyrockRoleService } from './services/role.service';
import { KeyrockPermissionService } from './services/permission.service';
import { LoginDto, KeyrockTokenDto, TokenInfoDto, TokenInfoResponseDto, CreateUserDto, UpdateUserDto, UserDto, CreateRoleDto, RoleDto, CreatePermissionDto, PermissionDto, AssignRoleToUserDto, AssignPermissionToRoleDto } from './dto/keyrock.dto';

@Injectable()
export class KeyrockService {
  constructor(
    private readonly authService: KeyrockAuthService,
    private readonly userService: KeyrockUserService,
    private readonly roleService: KeyrockRoleService,
    private readonly permissionService: KeyrockPermissionService,
  ) {}

  async getToken(loginDto: LoginDto): Promise<KeyrockTokenDto> {
    return this.authService.getToken(loginDto);
  }

  async getTokenInfo(tokenInfoDto: TokenInfoDto): Promise<TokenInfoResponseDto> {
    return this.authService.getTokenInfo(tokenInfoDto);
  }

  async createUser(createUserDto: CreateUserDto, token: string): Promise<UserDto> {
    return this.userService.createUser(createUserDto, token);
  }

  async getUser(userId: string, token: string): Promise<UserDto> {
    return this.userService.getUser(userId, token);
  }

  async listUsers(token: string): Promise<UserDto[]> {
    return this.userService.listUsers(token);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, token: string): Promise<UserDto> {
    return this.userService.updateUser(userId, updateUserDto, token);
  }

  async deleteUser(userId: string, token: string): Promise<void> {
    return this.userService.deleteUser(userId, token);
  }

  async createRole(appId: string, createRoleDto: CreateRoleDto, token: string): Promise<RoleDto> {
    return this.roleService.createRole(appId, createRoleDto, token);
  }

  async getRole(appId: string, roleId: string, token: string): Promise<RoleDto> {
    return this.roleService.getRole(appId, roleId, token);
  }

  async listRoles(appId: string, token: string): Promise<RoleDto[]> {
    return this.roleService.listRoles(appId, token);
  }

  async updateRole(appId: string, roleId: string, updateRoleDto: CreateRoleDto, token: string): Promise<RoleDto> {
    return this.roleService.updateRole(appId, roleId, updateRoleDto, token);
  }

  async deleteRole(appId: string, roleId: string, token: string): Promise<void> {
    return this.roleService.deleteRole(appId, roleId, token);
  }

  async assignRoleToUser(appId: string, assignDto: AssignRoleToUserDto, token: string): Promise<void> {
    return this.roleService.assignRoleToUser(appId, assignDto, token);
  }

  async removeRoleFromUser(appId: string, userId: string, roleId: string, token: string): Promise<void> {
    return this.roleService.removeRoleFromUser(appId, userId, roleId, token);
  }

  async listUserRoles(appId: string, userId: string, token: string): Promise<RoleDto[]> {
    return this.roleService.listUserRoles(appId, userId, token);
  }

  async createPermission(appId: string, createPermDto: CreatePermissionDto, token: string): Promise<PermissionDto> {
    return this.permissionService.createPermission(appId, createPermDto, token);
  }

  async getPermission(appId: string, permissionId: string, token: string): Promise<PermissionDto> {
    return this.permissionService.getPermission(appId, permissionId, token);
  }

  async listPermissions(appId: string, token: string): Promise<PermissionDto[]> {
    return this.permissionService.listPermissions(appId, token);
  }

  async updatePermission(appId: string, permissionId: string, updatePermDto: CreatePermissionDto, token: string): Promise<PermissionDto> {
    return this.permissionService.updatePermission(appId, permissionId, updatePermDto, token);
  }

  async deletePermission(appId: string, permissionId: string, token: string): Promise<void> {
    return this.permissionService.deletePermission(appId, permissionId, token);
  }

  async assignPermissionToRole(appId: string, roleId: string, assignDto: AssignPermissionToRoleDto, token: string): Promise<void> {
    return this.permissionService.assignPermissionToRole(appId, roleId, assignDto, token);
  }

  async removePermissionFromRole(appId: string, roleId: string, permissionId: string, token: string): Promise<void> {
    return this.permissionService.removePermissionFromRole(appId, roleId, permissionId, token);
  }

  async listRolePermissions(appId: string, roleId: string, token: string): Promise<PermissionDto[]> {
    return this.permissionService.listRolePermissions(appId, roleId, token);
  }
}
