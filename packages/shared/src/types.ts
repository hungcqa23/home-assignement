export interface Photo {
  id: string;
  filename: string;
  url: string;
  caption: string | null;
  createdAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: string | null;
  photoId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
}
