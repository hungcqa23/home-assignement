import axios from 'axios';
import type { ApiResponse, Photo, PresignedUrlResponse } from '@photo-app/shared';
import { httpClient, extractData } from '@/lib/api';

export const photosApi = {
  async requestUploadUrl(filename: string, contentType: string): Promise<PresignedUrlResponse> {
    const res = await httpClient.post<ApiResponse<PresignedUrlResponse>>('/photos/upload-url', {
      filename,
      contentType,
    });
    return extractData(res);
  },

  async uploadFileToR2(url: string, file: File): Promise<void> {
    await axios.put(url, file, {
      headers: { 'Content-Type': file.type },
    });
  },

  async create(data: { key: string; filename: string; caption?: string }): Promise<Photo> {
    const res = await httpClient.post<ApiResponse<Photo>>('/photos', data);
    return extractData(res);
  },

  async getAll(): Promise<Photo[]> {
    const res = await httpClient.get<ApiResponse<Photo[]>>('/photos');
    return extractData(res);
  },

  async getById(id: string): Promise<Photo> {
    const res = await httpClient.get<ApiResponse<Photo>>(`/photos/${id}`);
    return extractData(res);
  },
};
