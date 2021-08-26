import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreatePostDTO {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @MinLength(2)
  title: string;
}

export class UpdatePostDTO {
  @IsNotEmpty()
  @IsOptional()
  content: string;

  @IsNotEmpty()
  @IsOptional()
  title: string;
}

export class FindOneParams {
  @IsNumberString()
  id: string;
}
