import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { RequestUploadDto } from './dto/request-upload.dto';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  async requestUploadUrl(@Body() dto: RequestUploadDto) {
    const result = await this.photosService.requestUploadUrl(dto.filename, dto.contentType);
    return { data: result };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePhotoDto) {
    const photo = await this.photosService.create(dto);
    return { data: photo, message: 'Photo created successfully' };
  }

  @Get()
  async findAll() {
    const photos = await this.photosService.findAll();
    return { data: photos };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const photo = await this.photosService.findOne(id);
    return { data: photo };
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    const comment = await this.photosService.addComment(id, dto);
    return { data: comment, message: 'Comment added successfully' };
  }
}
