// DTOs define the structure of data
// They're used for request validation and response formatting


export class LoginDto {
  email: string;
  password: string;
}

export class TokenInfoDto {
  X_Auth_token: string;
  X_Subject_token: string
}

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export class UpdateUserDto {
  username?: string;
  email?: string;
  enabled?: boolean;
  gravatar?: boolean;
  date_password?: string;
  description?: string;
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
  name: string;
}

export class RoleDto {
  id: string;
  name: string;
  is_internal?: boolean;
}

export class CreatePermissionDto {
  name: string;
  description?: string;
  action: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  resource: string;
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
