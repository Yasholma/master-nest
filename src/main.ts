import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = new ConfigService();
  const PORT = configService.get('PORT');

  await app.listen(PORT);

  console.log(`Master Nest running on http://localhost:${PORT}`);
}
bootstrap();
