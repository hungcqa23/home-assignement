import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Comment cannot be empty' })
  @IsString()
  @MaxLength(1000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  author?: string;
}
