import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

/**
 * DTO for sending device data in Ultralight 2.0 format
 */
export class SendDeviceDataDto {
  @ApiProperty({
    description: 'API Key for the service group',
    example: '4jggokgpepnvsb2uv4s40d59ov',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({
    description: 'Device ID',
    example: 'sensor001',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Measurement data in Ultralight 2.0 format (key|value pairs separated by |)',
    example: 't|25|h|50',
  })
  @IsString()
  @IsNotEmpty()
  data: string;

  @ApiPropertyOptional({
    description: 'OAuth2 access token for PEP Proxy authentication (X-Auth-Token header). Required when PEP_PROXY_AUTH_ENABLED=true. Obtain via POST /oauth2/token with device credentials.',
    example: 'a7e22dfe2bd7d883c8621b9eb50797a7f126eeab',
  })
  @IsString()
  @IsOptional()
  accessToken?: string;
}

/**
 * DTO for sending device data in JSON format
 */
export class SendDeviceDataJsonDto {
  @ApiProperty({
    description: 'API Key for the service group',
    example: '4jggokgpepnvsb2uv4s40d59ov',
  })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({
    description: 'Device ID',
    example: 'sensor001',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Measurement data as JSON object',
    example: { temperature: 25, humidity: 50 },
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @ApiPropertyOptional({
    description: 'OAuth2 access token for PEP Proxy authentication (X-Auth-Token header). Required when PEP_PROXY_AUTH_ENABLED=true. Obtain via POST /oauth2/token with device credentials.',
    example: 'a7e22dfe2bd7d883c8621b9eb50797a7f126eeab',
  })
  @IsString()
  @IsOptional()
  accessToken?: string;
}
