import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LogsService } from './services/logs.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Register global logging interceptor (uses DI to get the shared LogsService)
  const logsService = app.get(LogsService);
  app.useGlobalInterceptors(new LoggingInterceptor(logsService));

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SSIO Project Gateway API')
    .setDescription(
      'API Gateway for FIWARE ecosystem integration. This gateway provides unified access to:\n\n' +
      '- **Keyrock**: Identity Management (Users, Roles, Permissions)\n' +
      '- **IoT Agent**: Device provisioning and management\n' +
      '- **Orion Context Broker**: Entity data management via PEP Proxy\n\n' +
      'All endpoints are secured with JWT authentication except /auth/login.'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and session management')
    .addTag('Users', 'User management operations')
    .addTag('Roles', 'Role-based access control')
    .addTag('Permissions', 'Permission management')
    .addTag('IoT Devices', 'IoT device provisioning and management')
    .addTag('IoT Service Groups', 'IoT service group configuration')
    .addTag('Orion Context Broker', 'Entity data management through PEP Proxy')
    .addTag('Logs', 'Real-time activity log stream (admin only)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SSIO Gateway API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`\n🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${process.env.PORT ?? 3000}/api/docs\n`);
}
bootstrap();

