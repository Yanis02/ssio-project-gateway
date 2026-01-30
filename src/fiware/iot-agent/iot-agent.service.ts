import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class IoTAgentService {
  private readonly iotAgentUrl: string;
  private readonly iotAgentSouthProxyUrl: string | null;
  private readonly fiwareService: string;
  private readonly fiwareServicePath: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.iotAgentUrl = this.configService.get<string>('IOT_AGENT_URL') || 'http://iot-agent:4041';
    this.iotAgentSouthProxyUrl = this.configService.get<string>('IOT_AGENT_SOUTH_PROXY_URL') || null;
    this.fiwareService = this.configService.get<string>('FIWARE_SERVICE') || 'openiot';
    this.fiwareServicePath = this.configService.get<string>('FIWARE_SERVICE_PATH') || '/';
  }

  /**
   * Get the South Port URL (proxy if configured, otherwise derive from North Port)
   */
  private getSouthPortUrl(): string {
    if (this.iotAgentSouthProxyUrl) {
      return this.iotAgentSouthProxyUrl;
    }
    // Fallback: derive south port URL from north port (4041 -> 7896)
    return this.iotAgentUrl.replace(':4041', ':7896');
  }

  /**
   * Forward request to IoT Agent with required headers
   */
  async forwardRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
    queryParams?: Record<string, any>,
  ): Promise<any> {
    const url = `${this.iotAgentUrl}${path}`;
    
    const headers = {
      'Fiware-Service': this.fiwareService,
      'Fiware-ServicePath': this.fiwareServicePath,
      'Content-Type': 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          headers,
          data: body,
          params: queryParams,
        }),
      );

      return response.data;
    } catch (error) {
      // Forward IoT Agent errors directly to client
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(
          error.response.data || error.message,
          error.response.status,
        );
      }
      throw error;
    }
  }

  /**
   * Service Groups API
   */
  async createServiceGroup(body: any): Promise<any> {
    return this.forwardRequest('POST', '/iot/services', body);
  }

  async getServiceGroups(): Promise<any> {
    return this.forwardRequest('GET', '/iot/services');
  }

  async deleteServiceGroup(queryParams?: Record<string, any>): Promise<any> {
    return this.forwardRequest('DELETE', '/iot/services', undefined, queryParams);
  }

  /**
   * Devices API
   */
  async createDevices(body: any): Promise<any> {
    return this.forwardRequest('POST', '/iot/devices', body);
  }

  async getDevices(): Promise<any> {
    return this.forwardRequest('GET', '/iot/devices');
  }

  async getDevice(deviceId: string): Promise<any> {
    return this.forwardRequest('GET', `/iot/devices/${deviceId}`);
  }

  async updateDevice(deviceId: string, body: any): Promise<any> {
    return this.forwardRequest('PUT', `/iot/devices/${deviceId}`, body);
  }

  async deleteDevice(deviceId: string): Promise<any> {
    return this.forwardRequest('DELETE', `/iot/devices/${deviceId}`);
  }

  /**
   * South Port API - Device Data Ingestion
   * These methods send data TO the IoT Agent's south port (7896/7897 via proxy)
   */

  /**
   * Send device measurement data (Ultralight 2.0 format)
   * POST /iot/d?k=<apikey>&i=<device_id>
   * @param apiKey - The API key for the service group
   * @param deviceId - The device ID
   * @param data - The measurement data in Ultralight format (e.g., "t|25|h|50")
   * @param accessToken - Optional OAuth2 access token for PEP Proxy authentication (X-Auth-Token header)
   */
  async sendDeviceData(
    apiKey: string,
    deviceId: string,
    data: string,
    accessToken?: string,
  ): Promise<any> {
    const url = `${this.getSouthPortUrl()}/iot/d`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'text/plain',
    };

    // Add X-Auth-Token header if access token provided (required when PEP_PROXY_AUTH_ENABLED=true)
    if (accessToken) {
      headers['X-Auth-Token'] = accessToken;
    }

    const params = {
      k: apiKey,
      i: deviceId,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: 'POST',
          url,
          headers,
          data,
          params,
        }),
      );

      return response.data || { success: true };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(
          error.response.data || error.message,
          error.response.status,
        );
      }
      throw error;
    }
  }

  /**
   * Send device measurement data in JSON format
   * POST /iot/json?k=<apikey>&i=<device_id>
   * @param apiKey - The API key for the service group
   * @param deviceId - The device ID
   * @param data - The measurement data as JSON object
   * @param accessToken - Optional OAuth2 access token for PEP Proxy authentication (X-Auth-Token header)
   */
  async sendDeviceDataJson(
    apiKey: string,
    deviceId: string,
    data: Record<string, any>,
    accessToken?: string,
  ): Promise<any> {
    const url = `${this.getSouthPortUrl()}/iot/json`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add X-Auth-Token header if access token provided (required when PEP_PROXY_AUTH_ENABLED=true)
    if (accessToken) {
      headers['X-Auth-Token'] = accessToken;
    }

    const params = {
      k: apiKey,
      i: deviceId,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: 'POST',
          url,
          headers,
          data,
          params,
        }),
      );

      return response.data || { success: true };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(
          error.response.data || error.message,
          error.response.status,
        );
      }
      throw error;
    }
  }

  /**
   * Check if South Port Proxy is configured
   */
  isSouthProxyConfigured(): boolean {
    return this.iotAgentSouthProxyUrl !== null;
  }

  /**
   * Get South Port URL (for debugging/info purposes)
   */
  getSouthPortUrlInfo(): string {
    return this.getSouthPortUrl();
  }
}
