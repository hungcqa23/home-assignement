import { IsNotEmpty, IsString, Matches } from 'class-validator';

const ALLOWED_MIME_PATTERN = /^image\/(jpeg|png|gif|webp)$/;

export class RequestUploadDto {
  @IsNotEmpty()
  @IsString()
  filename!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(ALLOWED_MIME_PATTERN, {
    message: 'contentType must be one of: image/jpeg, image/png, image/gif, image/webp',
  })
  contentType!: string;
}
