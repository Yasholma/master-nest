import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscribersController } from './subscribers.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SUBSCRIBERS_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('SUBSCRIBERS_SERVICE_HOST'),
            port: configService.get('SUBSCRIBERS_SERVICE_PORT'),
          },
        }),
    },
  ],
  controllers: [SubscribersController],
})
export class SubscribersModule {}
