import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoginDto, KeyrockTokenDto, TokenInfoDto, TokenInfoResponseDto } from '../dto/keyrock.dto';

@Injectable()
export class KeyrockAuthService {
  private readonly keyrockUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const keyrockUrl = this.configService.get<string>('KEYROCK_URL');
    if (!keyrockUrl) {
      throw new Error('KEYROCK_URL must be defined');
    }
    this.keyrockUrl = keyrockUrl;
    this.clientId = this.configService.get<string>('KEYROCK_CLIENT_ID') ?? '';
    this.clientSecret = this.configService.get<string>('KEYROCK_CLIENT_SECRET') ?? '';
  }

  async getToken(loginDto: LoginDto): Promise<KeyrockTokenDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.keyrockUrl}/v1/auth/tokens`,
          {
            name: loginDto.email,
            password: loginDto.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const accessToken = response.headers?.['x-subject-token'];
      if (!accessToken) {
        throw new HttpException('Missing access token in Keyrock response', HttpStatus.UNAUTHORIZED);
      }

      const expiresAt = response.data?.token?.expires_at;
      const expiresIn =
        expiresAt && !isNaN(Date.parse(expiresAt))
          ? Math.max(0, Math.floor((Date.parse(expiresAt) - Date.now()) / 1000))
          : 0;

      return {
        access_token: accessToken,
        expires_in: expiresIn,
      };
    } catch (error) {
      console.error('Keyrock Login Error:', error.response?.data || error.message);
      if (error.response) {
        const errorMessage = error || 'Login failed';
        throw new HttpException(errorMessage, error.response.status);
      }
      throw new HttpException('Keyrock service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getTokenInfo(tokenInfoDto: TokenInfoDto): Promise<TokenInfoResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keyrockUrl}/v1/auth/tokens`,
          {
            headers: {
              'X-Auth-token': tokenInfoDto.X_Auth_token,
              'X-Subject-token': tokenInfoDto.X_Subject_token,
            },
          },
        ),
      );
     console.log(response);
     
      const tokenData = response.data;

      return {
        access_token: tokenInfoDto.X_Subject_token,
        expires: tokenData.expires,
        valid: true,
        User: {
          id: tokenData.User.id,
          username: tokenData.User.username,
          email: tokenData.User.email,
          date_password: tokenData.User.date_password,
          enabled: tokenData.User.enabled,
          admin: tokenData.User.admin || false,
        },
      };
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return {
          access_token: tokenInfoDto.X_Subject_token,
          expires: '',
          valid: false,
          User: null,
        };
      }

      throw new HttpException(
        'Failed to validate token',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getOAuth2Token(email: string, password: string) {
    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.keyrockUrl}/oauth2/token`,
          new URLSearchParams({
            username: email,
            password: password,
            grant_type: 'password',
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${credentials}`,
              'Accept': 'application/json',
            },
          },
        ),
      );

      const { access_token, refresh_token, expires_in } = response.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        expiresIn: expires_in,
      };
    } catch (error) {
      console.error('OAuth2 token error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data?.error || 'OAuth2 authentication failed',
        error.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getUserInfo(oauth2Token: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.keyrockUrl}/user`, {
          headers: {
            'Authorization': `Bearer ${oauth2Token}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException('Failed to get user info', HttpStatus.UNAUTHORIZED);
    }
  }

  async refreshOAuth2Token(refreshToken: string) {
    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.keyrockUrl}/oauth2/token`,
          new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${credentials}`,
            },
          },
        ),
      );

      const { access_token, refresh_token, expires_in } = response.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        expiresIn: expires_in,
      };
    } catch (error) {
      throw new HttpException('Failed to refresh token', HttpStatus.UNAUTHORIZED);
    }
  }
}
