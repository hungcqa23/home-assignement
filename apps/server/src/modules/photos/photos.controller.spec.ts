import { Test, TestingModule } from '@nestjs/testing';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';

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

const mockPhotosService = {
  requestUploadUrl: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  addComment: jest.fn(),
};

describe('PhotosController', () => {
  let controller: PhotosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotosController],
      providers: [{ provide: PhotosService, useValue: mockPhotosService }],
    }).compile();

    controller = module.get<PhotosController>(PhotosController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('requestUploadUrl', () => {
    it('should return presigned URL data', async () => {
      const presigned = { url: 'https://presigned.url', key: 'photos/abc.jpg' };
      mockPhotosService.requestUploadUrl.mockResolvedValue(presigned);

      const result = await controller.requestUploadUrl({
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

      expect(result).toEqual({ data: presigned });
      expect(mockPhotosService.requestUploadUrl).toHaveBeenCalledWith('test.jpg', 'image/jpeg');
    });
  });

  describe('create', () => {
    it('should return created photo with success message', async () => {
      mockPhotosService.create.mockResolvedValue(mockPhoto);

      const result = await controller.create({
        key: 'photos/abc.jpg',
        filename: 'test.jpg',
        caption: 'A test photo',
      });

      expect(result).toEqual({ data: mockPhoto, message: 'Photo created successfully' });
    });
  });

  describe('findAll', () => {
    it('should return all photos', async () => {
      mockPhotosService.findAll.mockResolvedValue([mockPhoto]);

      const result = await controller.findAll();

      expect(result).toEqual({ data: [mockPhoto] });
    });
  });

  describe('findOne', () => {
    it('should return a single photo', async () => {
      mockPhotosService.findOne.mockResolvedValue(mockPhoto);

      const result = await controller.findOne('clxyz123');

      expect(result).toEqual({ data: mockPhoto });
      expect(mockPhotosService.findOne).toHaveBeenCalledWith('clxyz123');
    });
  });

  describe('addComment', () => {
    it('should return created comment with success message', async () => {
      mockPhotosService.addComment.mockResolvedValue(mockComment);

      const result = await controller.addComment('clxyz123', {
        content: 'Nice photo!',
        author: 'Alice',
      });

      expect(result).toEqual({ data: mockComment, message: 'Comment added successfully' });
      expect(mockPhotosService.addComment).toHaveBeenCalledWith('clxyz123', {
        content: 'Nice photo!',
        author: 'Alice',
      });
    });
  });
});
