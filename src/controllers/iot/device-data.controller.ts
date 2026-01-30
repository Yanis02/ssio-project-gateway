import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IoTService } from '../../services/iot.service';
import { SendDeviceDataDto, SendDeviceDataJsonDto } from './dto/device-data.dto';

@ApiTags('IoT Device Data')
@Controller('iot/data')
export class DeviceDataController {
  constructor(private readonly iotService: IoTService) {}

  @Post('ultralight')
  @ApiOperation({
    summary: 'Send device data (Ultralight 2.0)',
    description: 'Send measurement data from an IoT device using Ultralight 2.0 format. This forwards data to the IoT Agent South Port (via PEP Proxy if configured). Include accessToken when PEP_PROXY_AUTH_ENABLED=true.',
  })
  @ApiResponse({ status: 200, description: 'Data sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data format' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token (when auth enabled)' })
  @ApiResponse({ status: 404, description: 'Device or service group not found' })
  async sendDeviceData(@Body() dto: SendDeviceDataDto) {
    return this.iotService.sendDeviceData(dto.apiKey, dto.deviceId, dto.data, dto.accessToken);
  }

  @Post('json')
  @ApiOperation({
    summary: 'Send device data (JSON)',
    description: 'Send measurement data from an IoT device using JSON format. This forwards data to the IoT Agent South Port (via PEP Proxy if configured). Include accessToken when PEP_PROXY_AUTH_ENABLED=true.',
  })
  @ApiResponse({ status: 200, description: 'Data sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data format' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing access token (when auth enabled)' })
  @ApiResponse({ status: 404, description: 'Device or service group not found' })
  async sendDeviceDataJson(@Body() dto: SendDeviceDataJsonDto) {
    return this.iotService.sendDeviceDataJson(dto.apiKey, dto.deviceId, dto.data, dto.accessToken);
  }

  @Get('config')
  @ApiOperation({
    summary: 'Get South Port configuration',
    description: 'Returns information about the IoT Agent South Port configuration',
  })
  @ApiResponse({ status: 200, description: 'Configuration info returned' })
  async getSouthPortConfig() {
    return {
      southPortUrl: this.iotService.getSouthPortUrl(),
      proxyConfigured: this.iotService.isSouthProxyConfigured(),
    };
  }
}
