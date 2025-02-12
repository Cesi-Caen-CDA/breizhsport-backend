import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    const port = process.env.PORT || 8000;
    await app.listen(port);

    app.getHttpServer().once('Listening', () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log('Error starting the application', error);
  }
}

bootstrap();
