import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PostgresErrorCode, TokenType } from 'src/enum';
import User from 'src/user/entities/user.entity';

import { UserService } from 'src/user/user.service';
import { RegisterDTO } from './dtos';
import { TokenPayload } from './interfaces';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registrationData: RegisterDTO): Promise<User> {
    const hashdPassword = await bcrypt.hash(registrationData.password, 10);

    try {
      const createdUser = await this.userService.createUser({
        ...registrationData,
        password: hashdPassword,
      });

      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getAuthenticatedUser(
    email: string,
    hashdPassword: string,
  ): Promise<User> {
    try {
      const user = await this.userService.getByEmail(email);
      await this.verifyPassword(hashdPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  getCookieWithJwtAccessToken(userId: number): string {
    return this._getCookieWithKey(TokenType.AccessToken, userId);
  }

  getCookieWithJwtRefreshToken(userId: number): string {
    return this._getCookieWithKey(TokenType.RefreshToken, userId);
  }

  private _getCookieWithKey(key: string, userId: number): string {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);

    const expirationTime =
      key === TokenType.RefreshToken
        ? 'JWT_REFRESH_TOKEN_EXPIRATION_TIME'
        : 'JWT_ACCESS_TOKEN_EXPIRATION_TIME';

    const keyValue =
      key === TokenType.RefreshToken ? 'Refresh' : 'Authentication';

    return `${keyValue}=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      expirationTime,
    )}`;
  }

  getCookieForLogout(): string[] {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashdPassword: string,
  ): Promise<void> {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashdPassword,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }
}
