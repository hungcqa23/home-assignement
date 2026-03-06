import { useQuery } from '@tanstack/react-query';
import { photosApi } from '../api';

export function usePhoto(id: string) {
  return useQuery({
    queryKey: ['photos', id],
    queryFn: () => photosApi.getById(id),
  });
}
