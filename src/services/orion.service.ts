import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PepProxyService } from '../fiware/pep-proxy/pep-proxy.service';
import { SessionService } from './session.service';
import { KeyrockAuthService } from '../fiware/keyrock/services/auth.service';

/**
 * Business logic service for Orion Context Broker operations
 * Handles session management and token refresh before proxying to Orion
 */
@Injectable()
export class OrionService {
  constructor(
    private readonly pepProxyService: PepProxyService,
    private readonly sessionService: SessionService,
    private readonly keyrockAuthService: KeyrockAuthService,
  ) {}

  /**
   * Proxy request to Orion with session and token management
   */
  async proxyRequest(
    userId: string,
    method: string,
    path: string,
    body?: any,
    query?: any,
  ): Promise<any> {
    console.log('Looking for session with userId:', userId);
    const session = this.sessionService.getSession(userId);
    console.log('Session found:', !!session);
    
    if (!session) {
      throw new HttpException('Session not found', HttpStatus.UNAUTHORIZED);
    }

    if (this.sessionService.isTokenExpired(session.oauth2TokenExpiry)) {
      if (!session.oauth2RefreshToken) {
        throw new HttpException('Token expired, please login again', HttpStatus.UNAUTHORIZED);
      }

      const refreshed = await this.keyrockAuthService.refreshOAuth2Token(
        session.oauth2RefreshToken,
      );

      this.sessionService.updateSession(userId, {
        oauth2AccessToken: refreshed.accessToken,
        oauth2RefreshToken: refreshed.refreshToken,
        oauth2TokenExpiry: refreshed.expiresAt,
      });

      session.oauth2AccessToken = refreshed.accessToken;
    }

    return this.pepProxyService.proxyRequest(
      session.oauth2AccessToken,
      method,
      path,
      body,
      query,
    );
  }
}
