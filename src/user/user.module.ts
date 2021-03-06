import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FileModule } from 'src/file/file.module';
import { PrivateFilesModule } from 'src/privateFiles/privateFiles.module';

// @Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), FileModule, PrivateFilesModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
