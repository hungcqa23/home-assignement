import axios from 'axios';
import type { ApiResponse } from '@photo-app/shared';

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      axios.isAxiosError(error) && error.response?.data?.error
        ? error.response.data.error
        : (error.message ?? 'An unexpected error occurred');
    return Promise.reject(new Error(message));
  },
);

export function extractData<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}
