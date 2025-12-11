import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * FIWARE Infrastructure Service - PEP Proxy Gateway
 * Pure infrastructure service - NO business logic
 * Only handles HTTP forwarding to Orion via PEP Proxy
 */
@Injectable()
export class PepProxyService {
  private readonly pepProxyUrl: string;
  private readonly fiwareService: string;
  private readonly fiwareServicePath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.pepProxyUrl = this.configService.get<string>('PEP_PROXY_URL') || 'http://localhost:1027';
    this.fiwareService = this.configService.get<string>('FIWARE_SERVICE') || 'openiot';
    this.fiwareServicePath = this.configService.get<string>('FIWARE_SERVICE_PATH') || '/';
  }

  /**
   * Forward request to Orion Context Broker via PEP Proxy
   * @param oauth2Token - OAuth2 access token for authentication
   * @param method - HTTP method
   * @param path - API path
   * @param body - Request body (optional)
   * @param query - Query parameters (optional)
   */
  async proxyRequest(
    oauth2Token: string,
    method: string,
    path: string,
    body?: any,
    query?: any,
  ): Promise<any> {
    try {
      const url = `${this.pepProxyUrl}${path}`;
      const methodUpper = method.toUpperCase();
      
      const headers: any = {
        'X-Auth-Token': oauth2Token,
        'Fiware-Service': this.fiwareService,
        'Fiware-ServicePath': this.fiwareServicePath,
      };
      
      if (methodUpper === 'POST' || methodUpper === 'PUT' || methodUpper === 'PATCH') {
        headers['Content-Type'] = 'application/json';
      }

      const config: any = {
        headers,
        params: query,
      };

      let response;
      switch (methodUpper) {
        case 'GET':
          response = await firstValueFrom(this.httpService.get(url, config));
          break;
        case 'POST':
          response = await firstValueFrom(this.httpService.post(url, body, config));
          break;
        case 'PUT':
          response = await firstValueFrom(this.httpService.put(url, body, config));
          break;
        case 'PATCH':
          response = await firstValueFrom(this.httpService.patch(url, body, config));
          break;
        case 'DELETE':
          response = await firstValueFrom(this.httpService.delete(url, config));
          break;
        default:
          throw new HttpException('Method not supported', HttpStatus.METHOD_NOT_ALLOWED);
      }

      return response.data;
    } catch (error) {
      console.error('PEP Proxy error:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || 'Failed to access Orion Context Broker',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
