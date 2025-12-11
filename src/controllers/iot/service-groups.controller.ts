import { Controller, Post, Get, Delete, Body, Query } from '@nestjs/common';
import { IoTService } from '../../services/iot.service';
import { CreateServiceGroupDto } from '../../fiware/iot-agent/dto';

@Controller('iot/groups')
export class ServiceGroupsController {
  constructor(private readonly iotService: IoTService) {}

  @Post()
  async createServiceGroup(@Body() createServiceGroupDto: CreateServiceGroupDto) {
    return this.iotService.createServiceGroup(createServiceGroupDto);
  }

  @Get()
  async getServiceGroups() {
    return this.iotService.getServiceGroups();
  }

  @Delete()
  async deleteServiceGroup(@Query() queryParams: Record<string, any>) {
    return this.iotService.deleteServiceGroup(queryParams);
  }
}
