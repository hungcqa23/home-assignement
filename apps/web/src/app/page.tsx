import { AppLayout } from '@/components/layout';
import { PhotoGallery } from '@/features/photos';

export default function Home() {
  return (
    <AppLayout>
      <PhotoGallery />
    </AppLayout>
  );
}
