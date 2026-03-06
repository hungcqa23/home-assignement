import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async requestUploadUrl(filename: string, contentType: string) {
    return this.storage.generatePresignedUrl(filename, contentType);
  }

  async create(dto: CreatePhotoDto) {
    const url = this.storage.getPublicUrl(dto.key);

    return this.prisma.photo.create({
      data: {
        filename: dto.filename,
        url,
        caption: dto.caption || null,
      },
      include: { comments: true },
    });
  }

  async findAll() {
    return this.prisma.photo.findMany({
      include: { comments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: { comments: true },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with ID "${id}" not found`);
    }

    return photo;
  }

  async addComment(photoId: string, dto: CreateCommentDto) {
    await this.findOne(photoId);

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        author: dto.author || null,
        photoId,
      },
    });
  }
}
