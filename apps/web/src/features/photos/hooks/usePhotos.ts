import { useQuery } from '@tanstack/react-query';
import { photosApi } from '../api';

export function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: () => photosApi.getAll(),
  });
}
