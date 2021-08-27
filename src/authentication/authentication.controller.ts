import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { RegisterDTO } from './dtos';
import { JwtAthenticationGuard } from './guards/jwt-authentication.guard';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';
import { RequestWithUser } from './interfaces';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  strategy: 'exposeAll',
})
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(JwtAthenticationGuard)
  @Get()
  async authenticate(@Req() request: RequestWithUser) {
    return request.user;
  }

  @Post('register')
  async register(@Body() registrationData: RegisterDTO) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async login(@Req() request: RequestWithUser) {
    const { user } = request;

    const cookie = this.authenticationService.getCookieWithJwtToken(user.id);
    const response = (request as any).res;
    response.setHeader('Set-Cookie', cookie);

    return user;
  }

  @UseGuards(JwtAthenticationGuard)
  @Post('logout')
  async logout(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogout(),
    );

    return response.sendStatus(200);
  }
}
