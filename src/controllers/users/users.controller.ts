import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { UserManagementService } from '../../services/user-management.service';
import { CreateUserDto, UpdateUserDto } from '../../fiware/keyrock/dto/keyrock.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.userManagementService.createUser(createUserDto, req.user.userId);
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @Req() req: any) {
    return this.userManagementService.getUser(id, req.user.userId);
  }

  @Get()
  async listUsers(@Req() req: any) {
    return this.userManagementService.listUsers(req.user.userId);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.userManagementService.updateUser(id, updateUserDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    await this.userManagementService.deleteUser(id, req.user.userId);
  }

  @Get(':id/roles')
  async getUserRoles(
    @Param('id') userId: string,
    @Req() req: any,
  ) {
    return this.userManagementService.getUserRoles(userId, req.user.userId);
  }

  @Post(':id/roles')
  async assignRole(
    @Param('id') userId: string,
    @Body() body: { roleId: string },
    @Req() req: any,
  ) {
    await this.userManagementService.assignRoleToUser(userId, body.roleId, req.user.userId);
    return { message: 'Role assigned successfully' };
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
    @Req() req: any,
  ) {
    await this.userManagementService.removeRoleFromUser(userId, roleId, req.user.userId);
  }
}
