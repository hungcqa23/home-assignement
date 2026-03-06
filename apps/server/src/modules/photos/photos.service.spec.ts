import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const mockPhoto = {
  id: 'clxyz123',
  filename: 'test.jpg',
  url: 'https://r2.example.com/photos/abc.jpg',
  caption: 'A test photo',
  createdAt: new Date(),
  comments: [],
};

const mockComment = {
  id: 'clxyz456',
  content: 'Nice photo!',
  author: 'Alice',
  photoId: 'clxyz123',
  createdAt: new Date(),
};

const mockPrismaService = {
  photo: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const mockStorageService = {
  generatePresignedUrl: jest.fn(),
  getPublicUrl: jest.fn(),
  delete: jest.fn(),
};

describe('PhotosService', () => {
  let service: PhotosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<PhotosService>(PhotosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestUploadUrl', () => {
    it('should delegate to storage service', async () => {
      const expected = { url: 'https://presigned.url', key: 'photos/abc.jpg' };
      mockStorageService.generatePresignedUrl.mockResolvedValue(expected);

      const result = await service.requestUploadUrl('test.jpg', 'image/jpeg');

      expect(mockStorageService.generatePresignedUrl).toHaveBeenCalledWith(
        'test.jpg',
        'image/jpeg',
      );
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should resolve public URL and create a photo record', async () => {
      mockStorageService.getPublicUrl.mockReturnValue(mockPhoto.url);
      mockPrismaService.photo.create.mockResolvedValue(mockPhoto);

      const result = await service.create({
        key: 'photos/abc.jpg',
        filename: 'test.jpg',
        caption: 'A test photo',
      });

      expect(mockStorageService.getPublicUrl).toHaveBeenCalledWith('photos/abc.jpg');
      expect(mockPrismaService.photo.create).toHaveBeenCalledWith({
        data: {
          filename: 'test.jpg',
          url: mockPhoto.url,
          caption: 'A test photo',
        },
        include: { comments: true },
      });
      expect(result).toEqual(mockPhoto);
    });

    it('should store null caption when not provided', async () => {
      mockStorageService.getPublicUrl.mockReturnValue(mockPhoto.url);
      mockPrismaService.photo.create.mockResolvedValue({ ...mockPhoto, caption: null });

      await service.create({ key: 'photos/abc.jpg', filename: 'test.jpg' });

      expect(mockPrismaService.photo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ caption: null }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return photos ordered by createdAt descending', async () => {
      mockPrismaService.photo.findMany.mockResolvedValue([mockPhoto]);

      const result = await service.findAll();

      expect(mockPrismaService.photo.findMany).toHaveBeenCalledWith({
        include: { comments: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockPhoto]);
    });
  });

  describe('findOne', () => {
    it('should return a photo by id', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(mockPhoto);

      const result = await service.findOne('clxyz123');

      expect(mockPrismaService.photo.findUnique).toHaveBeenCalledWith({
        where: { id: 'clxyz123' },
        include: { comments: true },
      });
      expect(result).toEqual(mockPhoto);
    });

    it('should throw NotFoundException when photo does not exist', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addComment', () => {
    it('should verify photo exists then create a comment', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(mockPhoto);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.addComment('clxyz123', {
        content: 'Nice photo!',
        author: 'Alice',
      });

      expect(mockPrismaService.photo.findUnique).toHaveBeenCalledWith({
        where: { id: 'clxyz123' },
        include: { comments: true },
      });
      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'Nice photo!',
          author: 'Alice',
          photoId: 'clxyz123',
        },
      });
      expect(result).toEqual(mockComment);
    });

    it('should store null author when not provided', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(mockPhoto);
      mockPrismaService.comment.create.mockResolvedValue({ ...mockComment, author: null });

      await service.addComment('clxyz123', { content: 'Great!' });

      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: 'Great!',
          author: null,
          photoId: 'clxyz123',
        },
      });
    });

    it('should throw NotFoundException when photo does not exist', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(null);

      await expect(service.addComment('nonexistent', { content: 'Hello' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo from storage and database', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(mockPhoto);
      mockStorageService.delete.mockResolvedValue(undefined);
      mockPrismaService.photo.delete.mockResolvedValue(mockPhoto);

      await service.deletePhoto('clxyz123');

      expect(mockStorageService.delete).toHaveBeenCalledWith('photos/abc.jpg');
      expect(mockPrismaService.photo.delete).toHaveBeenCalledWith({
        where: { id: 'clxyz123' },
      });
    });

    it('should throw NotFoundException when photo does not exist', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(null);

      await expect(service.deletePhoto('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment when it belongs to the photo', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(mockPhoto);
      mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
      mockPrismaService.comment.delete.mockResolvedValue(mockComment);

      await service.deleteComment('clxyz123', 'clxyz456');

      expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
        where: { id: 'clxyz456' },
      });
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(mockPhoto);
      mockPrismaService.comment.findUnique.mockResolvedValue(null);

      await expect(service.deleteComment('clxyz123', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when comment belongs to different photo', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(mockPhoto);
      mockPrismaService.comment.findUnique.mockResolvedValue({
        ...mockComment,
        photoId: 'different-photo',
      });

      await expect(service.deleteComment('clxyz123', 'clxyz456')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when photo does not exist', async () => {
      mockPrismaService.photo.findUnique.mockResolvedValue(null);

      await expect(service.deleteComment('nonexistent', 'clxyz456')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
