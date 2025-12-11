import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, Headers, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OrionService } from '../../services/orion.service';

@ApiTags('Orion Context Broker')
@ApiBearerAuth('JWT-auth')
@Controller('orion')
@UseGuards(JwtAuthGuard)
export class OrionController {
  constructor(private readonly orionService: OrionService) {}

  @Get('entities')
  @ApiOperation({ summary: 'List entities', description: 'Retrieve all entities from Orion Context Broker via PEP Proxy' })
  @ApiResponse({ status: 200, description: 'Entities retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEntities(@Req() req: any, @Query() query: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'GET',
      '/v2/entities',
      null,
      query,
    );
  }

  @Get('entities/:id')
  @ApiOperation({ summary: 'Get entity by ID', description: 'Retrieve specific entity from Orion' })
  @ApiParam({ name: 'id', description: 'Entity ID', example: 'Sensor1' })
  @ApiResponse({ status: 200, description: 'Entity retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async getEntity(@Req() req: any, @Param('id') id: string, @Query() query: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'GET',
      `/v2/entities/${id}`,
      null,
      query,
    );
  }

  @Post('entities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create entity', description: 'Create a new entity in Orion Context Broker' })
  @ApiBody({ description: 'Entity data following NGSI-v2 format' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid entity format' })
  async createEntity(@Req() req: any, @Body() body: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'POST',
      '/v2/entities',
      body,
    );
  }

  @Patch('entities/:id/attrs')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update entity attributes', description: 'Partially update entity attributes' })
  @ApiParam({ name: 'id', description: 'Entity ID', example: 'Sensor1' })
  @ApiBody({ description: 'Attributes to update' })
  @ApiResponse({ status: 204, description: 'Entity updated successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async updateEntityAttrs(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'PATCH',
      `/v2/entities/${id}/attrs`,
      body,
    );
  }

  @Put('entities/:id/attrs')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Replace entity attributes', description: 'Replace all entity attributes' })
  @ApiParam({ name: 'id', description: 'Entity ID', example: 'Sensor1' })
  @ApiBody({ description: 'New attributes' })
  @ApiResponse({ status: 204, description: 'Entity attributes replaced successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async replaceEntityAttrs(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'PUT',
      `/v2/entities/${id}/attrs`,
      body,
    );
  }

  @Delete('entities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete entity', description: 'Remove entity from Orion' })
  @ApiParam({ name: 'id', description: 'Entity ID', example: 'Sensor1' })
  @ApiResponse({ status: 204, description: 'Entity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async deleteEntity(@Req() req: any, @Param('id') id: string) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'DELETE',
      `/v2/entities/${id}`,
    );
  }

  @Post('op/update')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Batch update', description: 'Perform batch operations on multiple entities' })
  @ApiBody({ description: 'Batch operation data (create, update, delete)' })
  @ApiResponse({ status: 204, description: 'Batch operation completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid batch format' })
  async batchUpdate(@Req() req: any, @Body() body: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'POST',
      '/v2/op/update',
      body,
    );
  }

  @Get('types')
  @ApiOperation({ summary: 'List entity types', description: 'Retrieve all entity types in Orion' })
  @ApiResponse({ status: 200, description: 'Entity types retrieved successfully' })
  async getTypes(@Req() req: any, @Query() query: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'GET',
      '/v2/types',
      null,
      query,
    );
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List subscriptions', description: 'Retrieve all subscriptions from Orion' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async getSubscriptions(@Req() req: any, @Query() query: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'GET',
      '/v2/subscriptions',
      null,
      query,
    );
  }

  @Post('subscriptions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create subscription', description: 'Create a new subscription for entity notifications' })
  @ApiBody({ description: 'Subscription configuration' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid subscription format' })
  async createSubscription(@Req() req: any, @Body() body: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'POST',
      '/v2/subscriptions',
      body,
    );
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get subscription by ID', description: 'Retrieve specific subscription details' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async getSubscription(@Req() req: any, @Param('id') id: string) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'GET',
      `/v2/subscriptions/${id}`,
    );
  }

  @Patch('subscriptions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update subscription', description: 'Update subscription configuration' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiBody({ description: 'Updated subscription configuration' })
  @ApiResponse({ status: 204, description: 'Subscription updated successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async updateSubscription(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'PATCH',
      `/v2/subscriptions/${id}`,
      body,
    );
  }

  @Delete('subscriptions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete subscription', description: 'Remove subscription from Orion' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({ status: 204, description: 'Subscription deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async deleteSubscription(@Req() req: any, @Param('id') id: string) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'DELETE',
      `/v2/subscriptions/${id}`,
    );
  }
}
