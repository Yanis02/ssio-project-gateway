import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { KeyrockAuthService } from '../fiware/keyrock/services/auth.service';
import { KeyrockRoleService } from '../fiware/keyrock/services/role.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  private readonly appId: string;

  constructor(
    private readonly keyrockAuthService: KeyrockAuthService,
    private readonly keyrockRoleService: KeyrockRoleService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('KEYROCK_APP_ID') || '';
    if (!this.appId) {
      throw new Error('KEYROCK_APP_ID environment variable is required');
    }
  }

  async login(email: string, password: string) {
    // Step 1: Get management token for Keyrock admin operations
    const managementTokenData = await this.keyrockAuthService.getToken({ email, password });
    
    // Step 2: Get OAuth2 token for PEP Proxy access using password grant
    const oauth2TokenData = await this.keyrockAuthService.getOAuth2Token(email, password);

    // Step 3: Get user info using OAuth2 token
    const userInfo = await this.keyrockAuthService.getUserInfo(oauth2TokenData.accessToken);
    console.log('User info from Keyrock:', { id: userInfo.id, username: userInfo.username, email: userInfo.email });

    // Step 4: Fetch user roles using management token
    let roleNames: string[] = [];
    try {
      const roles = await this.keyrockRoleService.listUserRoles(
        this.appId,
        userInfo.id,
        managementTokenData.access_token,
      );
      roleNames = roles.map((r: any) => r.role_id || r.name || 'user');
    } catch (error) {
      console.warn('Could not fetch user roles:', error.message);
      roleNames = ['user'];
    }

    // Step 5: Create session with both tokens
    this.sessionService.createSession(userInfo.id, {
      userId: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      roles: roleNames,
      keyrockManagementToken: managementTokenData.access_token,
      oauth2AccessToken: oauth2TokenData.accessToken,
      oauth2RefreshToken: oauth2TokenData.refreshToken,
      keyrockTokenExpiry: new Date(Date.now() + managementTokenData.expires_in * 1000),
      oauth2TokenExpiry: oauth2TokenData.expiresAt,
    });

    // Step 6: Generate JWT (NO TOKENS EXPOSED - only user info)
    const jwtPayload = {
      userId: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      roles: roleNames,
    };
    console.log('JWT payload:', jwtPayload);

    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      accessToken,
      expiresIn: oauth2TokenData.expiresIn,
      user: {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        roles: roleNames,
      },
    };
  }

  async validateUser(userId: string) {
    const session = this.sessionService.getSession(userId);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }

    if (this.sessionService.isTokenExpired(session.oauth2TokenExpiry)) {
      if (session.oauth2RefreshToken) {
        const refreshed = await this.keyrockAuthService.refreshOAuth2Token(
          session.oauth2RefreshToken,
        );
        this.sessionService.updateSession(userId, {
          oauth2AccessToken: refreshed.accessToken,
          oauth2RefreshToken: refreshed.refreshToken,
          oauth2TokenExpiry: refreshed.expiresAt,
        });
      } else {
        throw new UnauthorizedException('Token expired, please login again');
      }
    }

    return session;
  }

  async logout(userId: string): Promise<void> {
    this.sessionService.deleteSession(userId);
  }
}
