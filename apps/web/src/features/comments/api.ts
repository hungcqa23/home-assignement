import type { ApiResponse, Comment } from '@photo-app/shared';
import { httpClient, extractData } from '@/lib/api';

export const commentsApi = {
  async create(photoId: string, data: { content: string; author?: string }): Promise<Comment> {
    const res = await httpClient.post<ApiResponse<Comment>>(`/photos/${photoId}/comments`, data);
    return extractData(res);
  },
};
