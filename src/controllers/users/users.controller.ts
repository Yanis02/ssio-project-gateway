import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserManagementService } from '../../services/user-management.service';
import { CreateUserDto, UpdateUserDto } from '../../fiware/keyrock/dto/keyrock.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create user', description: 'Create a new user in Keyrock' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.userManagementService.createUser(createUserDto, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve user information by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User information retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string, @Req() req: any) {
    return this.userManagementService.getUser(id, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all users', description: 'Retrieve list of all users' })
  @ApiResponse({ status: 200, description: 'Users list retrieved' })
  async listUsers(@Req() req: any) {
    return this.userManagementService.listUsers(req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user', description: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.userManagementService.updateUser(id, updateUserDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user', description: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    await this.userManagementService.deleteUser(id, req.user.userId);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get user roles', description: 'Retrieve roles assigned to a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User roles retrieved' })
  async getUserRoles(
    @Param('id') userId: string,
    @Req() req: any,
  ) {
    return this.userManagementService.getUserRoles(userId, req.user.userId);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign role to user', description: 'Assign a role to a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRole(
    @Param('id') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Req() req: any,
  ) {
    await this.userManagementService.assignRoleToUser(userId, assignRoleDto.roleId, req.user.userId);
    return { message: 'Role assigned successfully' };
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove role from user', description: 'Remove a role assignment from a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({ status: 204, description: 'Role removed successfully' })
  async removeRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
    @Req() req: any,
  ) {
    await this.userManagementService.removeRoleFromUser(userId, roleId, req.user.userId);
  }
}
