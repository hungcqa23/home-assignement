import type { ApiResponse, Photo, PresignedUrlResponse } from '@photo-app/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }),

  uploadPhoto: async (file: File, caption?: string): Promise<ApiResponse<Photo>> => {
    const { data: presigned } = await api.post<PresignedUrlResponse>('/photos/upload-url', {
      filename: file.name,
      contentType: file.type,
    });

    await fetch(presigned.url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    return api.post<Photo>('/photos', {
      key: presigned.key,
      filename: file.name,
      caption,
    });
  },
};
