import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Repository } from 'typeorm';
import PrivateFile from './privateFile.entity';
import { v4 as uuid } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class PrivateFilesService {
  constructor(
    @InjectRepository(PrivateFile)
    private privateFilesRepository: Repository<PrivateFile>,
    private readonly configService: ConfigService,
  ) {}

  async uploadPrivateFile(
    buffer: Buffer,
    ownerId: number,
    filename: string,
  ): Promise<PrivateFile> {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
        Body: buffer,
        Key: `${uuid()}-${filename}`,
      })
      .promise();

    const newFile = this.privateFilesRepository.create({
      key: uploadResult.Key,
      owner: {
        id: ownerId,
      },
    });

    await this.privateFilesRepository.save(newFile);
    return newFile;
  }

  async getPrivateFile(
    fileId: number,
  ): Promise<{ stream: Readable; info: PrivateFile }> {
    const s3 = new S3();

    const fileInfo = await this.privateFilesRepository.findOne(
      { id: fileId },
      { relations: ['owner'] },
    );

    if (fileInfo) {
      const stream = await s3
        .getObject({
          Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
          Key: fileInfo.key,
        })
        .createReadStream();

      return {
        stream,
        info: fileInfo,
      };
    }

    throw new NotFoundException();
  }

  async generatePresignedUrl(key: string): Promise<string> {
    const s3 = new S3();
    return s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
      Key: key,
    });
  }
}
