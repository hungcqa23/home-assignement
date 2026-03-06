import { useMutation, useQueryClient } from '@tanstack/react-query';
import { photosApi } from '../api';

interface UploadPhotoInput {
  file: File;
  caption?: string;
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, caption }: UploadPhotoInput) => {
      const presigned = await photosApi.requestUploadUrl(file.name, file.type);
      await photosApi.uploadFileToR2(presigned.url, file);
      return photosApi.create({
        key: presigned.key,
        filename: file.name,
        caption,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
}
