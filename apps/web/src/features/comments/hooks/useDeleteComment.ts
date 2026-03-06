import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api';

export function useDeleteComment(photoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.delete(photoId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['photos', photoId] });
    },
  });
}
