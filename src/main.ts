import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Breizhsport')
    .setDescription('API Breizhsport')
    .setVersion('1.0')
    .addTag('bzSport')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: '/api-json',
  });
  
  await app.listen(process.env.PORT ?? 8000);
  console.log(
    `\n Application is running on: ${await app.getUrl()}` +
    `\n You can see the Swagger API documentation at: ${await app.getUrl()}/api `,
  );
}

bootstrap();
