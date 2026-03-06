import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { PhotoDetail } from '@/features/photos';

interface PhotoPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Photo Detail',
};

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <PhotoDetail photoId={id} />
    </AppLayout>
  );
}
