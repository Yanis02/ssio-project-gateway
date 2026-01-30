import { Injectable } from '@nestjs/common';
import { IoTAgentService } from '../fiware/iot-agent/iot-agent.service';

/**
 * Business logic service for IoT Agent operations
 * Wraps FIWARE IoT Agent infrastructure service
 */
@Injectable()
export class IoTService {
  constructor(private readonly iotAgentService: IoTAgentService) {}

  /**
   * Service Groups
   */
  async createServiceGroup(body: any): Promise<any> {
    return this.iotAgentService.createServiceGroup(body);
  }

  async getServiceGroups(): Promise<any> {
    return this.iotAgentService.getServiceGroups();
  }

  async deleteServiceGroup(queryParams?: Record<string, any>): Promise<any> {
    return this.iotAgentService.deleteServiceGroup(queryParams);
  }

  /**
   * Devices
   */
  async createDevices(body: any): Promise<any> {
    return this.iotAgentService.createDevices(body);
  }

  async getDevices(): Promise<any> {
    return this.iotAgentService.getDevices();
  }

  async getDevice(deviceId: string): Promise<any> {
    return this.iotAgentService.getDevice(deviceId);
  }

  async updateDevice(deviceId: string, body: any): Promise<any> {
    return this.iotAgentService.updateDevice(deviceId, body);
  }

  async deleteDevice(deviceId: string): Promise<any> {
    return this.iotAgentService.deleteDevice(deviceId);
  }

  /**
   * Device Data Ingestion (South Port)
   * @param accessToken - Optional OAuth2 access token for PEP Proxy authentication
   */
  async sendDeviceData(apiKey: string, deviceId: string, data: string, accessToken?: string): Promise<any> {
    return this.iotAgentService.sendDeviceData(apiKey, deviceId, data, accessToken);
  }

  async sendDeviceDataJson(apiKey: string, deviceId: string, data: Record<string, any>, accessToken?: string): Promise<any> {
    return this.iotAgentService.sendDeviceDataJson(apiKey, deviceId, data, accessToken);
  }

  /**
   * South Port Configuration Info
   */
  isSouthProxyConfigured(): boolean {
    return this.iotAgentService.isSouthProxyConfigured();
  }

  getSouthPortUrl(): string {
    return this.iotAgentService.getSouthPortUrlInfo();
  }
}
