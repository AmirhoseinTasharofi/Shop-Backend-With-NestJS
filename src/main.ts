import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //===================================================================
  //=========================Validation Pipe===========================

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

  //====================================================================
  //=======================Configure Swagger============================

  const config = new DocumentBuilder()
  .setTitle('Shop API NestJs')
  .setDescription('Backend API Documentation for Shop')
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token',
  )
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
  },
});

//=====================================================================

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
