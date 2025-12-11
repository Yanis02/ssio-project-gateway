import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, Headers, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OrionService } from '../../services/orion.service';

@Controller('orion')
@UseGuards(JwtAuthGuard)
export class OrionController {
  constructor(private readonly orionService: OrionService) {}

  @Get('entities')
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
  async deleteEntity(@Req() req: any, @Param('id') id: string) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'DELETE',
      `/v2/entities/${id}`,
    );
  }

  @Post('op/update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async batchUpdate(@Req() req: any, @Body() body: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'POST',
      '/v2/op/update',
      body,
    );
  }

  @Get('types')
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
  async createSubscription(@Req() req: any, @Body() body: any) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'POST',
      '/v2/subscriptions',
      body,
    );
  }

  @Get('subscriptions/:id')
  async getSubscription(@Req() req: any, @Param('id') id: string) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'GET',
      `/v2/subscriptions/${id}`,
    );
  }

  @Patch('subscriptions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  async deleteSubscription(@Req() req: any, @Param('id') id: string) {
    return this.orionService.proxyRequest(
      req.user.userId,
      'DELETE',
      `/v2/subscriptions/${id}`,
    );
  }
}
