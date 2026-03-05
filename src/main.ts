import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import connectDB from './config/database';
import swaggerSpec from './config/swagger';
import * as swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import CONFIG from './config/config';
import { ValidationPipe } from '@nestjs/common';
import { RedisConnect } from './integrations/Redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await connectDB();
  await RedisConnect();

  app.use(cookieParser());

  app.enableCors({
    origin: CONFIG.corsOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, x-retry-count, Access-Control-Allow-Origin',
    exposedHeaders: ['Content-Type','Authorization', 'Access-Control-Allow-Origin',],
  });

  app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');

  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  if (process.env.NODE_ENV !== 'production') {
    instance.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  await import('./integrations/QueueManager.js')
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running on port http://localhost:${port}`);
}
bootstrap();
