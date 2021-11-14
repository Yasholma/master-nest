import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { CreateSubscriberDTO } from './create-subscriber.dto';

@Controller('subscribers')
export class SubscribersController {
  constructor(
    @Inject('SUBSCRIBERS_SERVICE') private subscribersService: ClientProxy,
  ) {}

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  async getSubscribers() {
    return this.subscribersService.send({ cmd: 'get-subscribers' }, '');
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createSubscriber(@Body() createSubscriberDto: CreateSubscriberDTO) {
    // return this.subscribersService.send(
    //   { cmd: 'add-subscriber' },
    //   createSubscriberDto,
    // );

    return this.subscribersService.emit(
      {
        cmd: 'add-subscriber',
      },
      createSubscriberDto,
    );
  }
}
