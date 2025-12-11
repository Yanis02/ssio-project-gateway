import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class IoTAgentService {
  private readonly iotAgentUrl: string;
  private readonly fiwareService: string;
  private readonly fiwareServicePath: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.iotAgentUrl = this.configService.get<string>('IOT_AGENT_URL') || 'http://iot-agent:4041';
    this.fiwareService = this.configService.get<string>('FIWARE_SERVICE') || 'openiot';
    this.fiwareServicePath = this.configService.get<string>('FIWARE_SERVICE_PATH') || '/';
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
}
