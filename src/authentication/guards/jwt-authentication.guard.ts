import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAthenticationGuard extends AuthGuard('jwt') {}
