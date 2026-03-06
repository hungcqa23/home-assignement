import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../api';

interface AddCommentInput {
  content: string;
  author?: string;
}

export function useAddComment(photoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddCommentInput) => commentsApi.create(photoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['photos', photoId] });
    },
  });
}
