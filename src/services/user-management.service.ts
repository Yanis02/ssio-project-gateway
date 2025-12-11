import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeyrockUserService } from '../fiware/keyrock/services/user.service';
import { KeyrockRoleService } from '../fiware/keyrock/services/role.service';
import { CreateUserDto, UpdateUserDto } from '../fiware/keyrock/dto/keyrock.dto';
import { SessionService } from './session.service';

@Injectable()
export class UserManagementService {
  private readonly appId: string;

  constructor(
    private readonly keyrockUserService: KeyrockUserService,
    private readonly keyrockRoleService: KeyrockRoleService,
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

  async createUser(data: CreateUserDto, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockUserService.createUser(data, token);
  }

  async getUser(userId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockUserService.getUser(userId, token);
  }

  async listUsers(currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockUserService.listUsers(token);
  }

  async updateUser(userId: string, data: UpdateUserDto, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockUserService.updateUser(userId, data, token);
  }

  async deleteUser(userId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockUserService.deleteUser(userId, token);
  }

  async getUserRoles(userId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockRoleService.listUserRoles(this.appId, userId, token);
  }

  async assignRoleToUser(userId: string, roleId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockRoleService.assignRoleToUser(
      this.appId,
      { user_id: userId, role_id: roleId },
      token,
    );
  }

  async removeRoleFromUser(userId: string, roleId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockRoleService.removeRoleFromUser(this.appId, userId, roleId, token);
  }
}
