import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePhotoDto {
  @IsNotEmpty()
  @IsString()
  key!: string;

  @IsNotEmpty()
  @IsString()
  filename!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;
}
