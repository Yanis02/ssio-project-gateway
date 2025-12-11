// DTOs define the structure of data
// They're used for request validation and response formatting
import { IsEmail, IsString, MinLength, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class LoginDto {
  @ApiProperty({
    example: 'alice-the-admin@test.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'test',
    description: 'User password (minimum 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Password must be at least 3 characters long' })
  password: string;
}

export class TokenInfoDto {
  X_Auth_token: string;
  X_Subject_token: string
}

export class CreateUserDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username (minimum 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'SecurePass123',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'john_doe_updated',
    description: 'Updated username',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username?: string;

  @ApiProperty({
    example: 'newemail@example.com',
    description: 'Updated email address',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user account is enabled',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    example: false,
    description: 'Enable gravatar for user',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  gravatar?: boolean;

  @IsOptional()
  @IsString()
  date_password?: string;

  @ApiProperty({
    example: 'Software developer with 5 years experience',
    description: 'User description/bio',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'User website URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;
}


export class KeyrockTokenDto {
  access_token: string;
  expires_in: number;
}

export class LoginResponseDto {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}

export class SessionDataDto {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  keyrockManagementToken: string;
  oauth2AccessToken: string;
  oauth2RefreshToken?: string;
  keyrockTokenExpiry: Date;
  oauth2TokenExpiry: Date;
}


export class UserDto {
  id: string;
  username: string;
  email: string;
  enabled: boolean;
  date_password?: string;
  admin?: boolean;
}

/**
 * DTO for token info response
 * This is what Keyrock returns when validating a token
 */
export class TokenInfoResponseDto {
  access_token: string;
  expires: string;
  valid: boolean;
  User: UserDto | null;
}

export class CreateRoleDto {
  @IsString()
  @MinLength(3, { message: 'Role name must be at least 3 characters long' })
  name: string;
}

export class RoleDto {
  id: string;
  name: string;
  is_internal?: boolean;
}

export class CreatePermissionDto {
  @ApiProperty({
    example: 'Read Users',
    description: 'Permission name (minimum 3 characters)',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Permission name must be at least 3 characters long' })
  name: string;

  @ApiProperty({
    example: 'Allows reading user information',
    description: 'Permission description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'GET',
    description: 'HTTP method',
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], { message: 'Action must be one of: GET, POST, PUT, PATCH, DELETE' })
  action: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  @ApiProperty({
    example: '/api/users',
    description: 'Resource path or pattern',
  })
  @IsString()
  @MinLength(1, { message: 'Resource must not be empty' })
  resource: string;

  @ApiProperty({
    example: false,
    description: 'Whether the resource is a regex pattern',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_regex?: boolean;
}

export class PermissionDto {
  id: string;
  name: string;
  description: string;
  action: string;
  resource: string;
  xml?: string;
  is_regex: boolean;
}

export class AssignRoleToUserDto {
  user_id: string;
  role_id: string;
  organization_id?: string;
}

export class AssignPermissionToRoleDto {
  permission_id: string;
}
