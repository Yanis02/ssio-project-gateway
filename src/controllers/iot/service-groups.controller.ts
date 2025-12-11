import { Controller, Post, Get, Delete, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IoTService } from '../../services/iot.service';
import { CreateServiceGroupDto } from '../../fiware/iot-agent/dto';
import { DeleteServiceGroupQueryDto } from './dto/delete-service-group-query.dto';

@ApiTags('IoT Service Groups')
@Controller('iot/groups')
export class ServiceGroupsController {
  constructor(private readonly iotService: IoTService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create service group', 
    description: 'Provision a new service group in IoT Agent for device communication' 
  })
  @ApiResponse({ status: 201, description: 'Service group created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  async createServiceGroup(@Body() createServiceGroupDto: CreateServiceGroupDto) {
    return this.iotService.createServiceGroup(createServiceGroupDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all service groups', 
    description: 'Retrieve list of all provisioned service groups' 
  })
  @ApiResponse({ status: 200, description: 'Service groups list retrieved' })
  async getServiceGroups() {
    return this.iotService.getServiceGroups();
  }

  @Delete()
  @ApiOperation({ 
    summary: 'Delete service group', 
    description: 'Delete a service group by resource or apikey' 
  })
  @ApiQuery({ name: 'resource', required: false, description: 'Resource path' })
  @ApiQuery({ name: 'apikey', required: false, description: 'API key' })
  @ApiResponse({ status: 200, description: 'Service group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Service group not found' })
  async deleteServiceGroup(@Query() queryParams: DeleteServiceGroupQueryDto) {
    return this.iotService.deleteServiceGroup(queryParams);
  }
}
