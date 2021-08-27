import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCategoryDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
}
