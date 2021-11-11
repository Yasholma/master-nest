import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePostDTO {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @MinLength(2)
  title: string;

  @IsString({ each: true })
  @IsNotEmpty()
  paragraphs: string[];
}

export class UpdatePostDTO {
  @IsNotEmpty()
  @IsOptional()
  content: string;

  @IsNotEmpty()
  @IsOptional()
  title: string;

  @IsString({ each: true })
  @IsOptional()
  paragraphs: string[];
}

export class FindOneParams {
  @IsNumberString()
  id: string;
}
