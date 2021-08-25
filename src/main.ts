import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = new ConfigService();
  const PORT = configService.get('PORT');
  app.use(cookieParser());

  await app.listen(PORT);

  console.log(`Master Nest running on http://localhost:${PORT}`);
}
bootstrap();
