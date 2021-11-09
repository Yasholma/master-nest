import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PublicFile from 'src/file/entities/file.entity';
import { FileService } from 'src/file/file.service';
import PrivateFile from 'src/privateFiles/privateFile.entity';
import { PrivateFilesService } from 'src/privateFiles/privateFiles.service';
import { Readable } from 'stream';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dtos';
import User from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly fileService: FileService,
    private readonly privateFilesService: PrivateFilesService,
  ) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });

    if (user) {
      return user;
    }

    throw new NotFoundException('User with this email does not exist');
  }

  async getById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ id: userId });

    if (user) {
      return user;
    }

    throw new NotFoundException('User with this id does not exist');
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    const newUser = this.userRepository.create(userData);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async addAvatar(
    userId: number,
    imageBuffer: Buffer,
    filename: string,
  ): Promise<PublicFile> {
    const user = await this.getById(userId);

    if (user.avatar) {
      await this.userRepository.update(userId, { ...user, avatar: null });

      await this.fileService.deletePublicFile(user.avatar.id);
    }

    const avatar = await this.fileService.uploadPublicFile(
      imageBuffer,
      filename,
    );

    await this.userRepository.update(userId, {
      ...user,
      avatar,
    });

    return avatar;
  }

  async deleteAvatar(userId: number): Promise<void> {
    const user = await this.getById(userId);
    const fileId = user.avatar?.id;

    if (fileId) {
      await this.userRepository.update(userId, {
        ...user,
        avatar: null,
      });

      await this.fileService.deletePublicFile(fileId);
    }
  }

  async addPrivateFile(
    userId: number,
    buffer: Buffer,
    filename: string,
  ): Promise<PrivateFile> {
    return this.privateFilesService.uploadPrivateFile(buffer, userId, filename);
  }

  async getPrivateFile(
    userId: number,
    fileId: number,
  ): Promise<{ stream: Readable; info: PrivateFile }> {
    const file = await this.privateFilesService.getPrivateFile(fileId);
    if (file.info.owner.id === userId) {
      return file;
    }
    throw new UnauthorizedException();
  }

  async getAllPrivateFiles(userId: number): Promise<any> {
    const userWithFiles = await this.userRepository.findOne(
      { id: userId },
      { relations: ['files'] },
    );

    if (userWithFiles) {
      return Promise.all(
        userWithFiles.files.map(async (file: PrivateFile) => {
          const url = await this.privateFilesService.generatePresignedUrl(
            file.key,
          );

          return {
            ...file,
            url,
          };
        }),
      );
    }

    throw new NotFoundException('User with this id does not exist');
  }
}
