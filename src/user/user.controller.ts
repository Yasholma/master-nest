import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthenticationGuard } from 'src/authentication/guards/jwt-authentication.guard';
import { RequestWithUser } from 'src/authentication/interfaces';
import { UserService } from './user.service';
import { Express, Response } from 'express';
import { FindOneParams } from 'src/posts/dtos';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('avatar')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.addAvatar(
      request.user.id,
      file.buffer,
      file.originalname,
    );
  }

  @Post('files')
  @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addPrivateFile(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.addPrivateFile(
      request.user.id,
      file.buffer,
      file.originalname,
    );
  }

  @Get('files/:id')
  @UseGuards(JwtAuthenticationGuard)
  async getPrivateFile(
    @Req() request: RequestWithUser,
    @Res() response: Response,
    @Param() { id }: FindOneParams,
  ) {
    const file = await this.userService.getPrivateFile(
      request.user.id,
      Number(id),
    );
    file.stream.pipe(response);
  }

  @Get('files')
  @UseGuards(JwtAuthenticationGuard)
  async getAllPrivateFiles(@Req() request: RequestWithUser) {
    return this.userService.getAllPrivateFiles(request.user.id);
  }
}
