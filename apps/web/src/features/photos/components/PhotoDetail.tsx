'use client';

import { Spin, Alert, Typography, Card, Divider, Button, Popconfirm, App } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getErrorMessage, formatDate } from '@/lib';
import { CommentForm, CommentList } from '@/features/comments';
import { usePhoto } from '../hooks/usePhoto';
import { useDeletePhoto } from '../hooks/useDeletePhoto';

interface PhotoDetailProps {
  photoId: string;
}

export default function PhotoDetail({ photoId }: PhotoDetailProps) {
  const router = useRouter();
  const { data: photo, isLoading, error } = usePhoto(photoId);
  const deletePhoto = useDeletePhoto();
  const { message } = App.useApp();

  const handleDeletePhoto = async () => {
    try {
      await deletePhoto.mutateAsync(photoId);
      message.success('Photo deleted successfully');
      router.push('/');
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Failed to load photo"
        description={getErrorMessage(error)}
        showIcon
      />
    );
  }

  if (!photo) {
    return <Alert type="warning" message="Photo not found" showIcon />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.push('/')}>
          Back to Gallery
        </Button>
        <Popconfirm
          title="Delete photo"
          description="Are you sure? This will also delete all comments."
          onConfirm={handleDeletePhoto}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button danger icon={<DeleteOutlined />} loading={deletePhoto.isPending}>
            Delete Photo
          </Button>
        </Popconfirm>
      </div>

      <Card>
        <div
          style={{ position: 'relative', width: '100%', paddingTop: '66.67%', marginBottom: 16 }}
        >
          <Image
            src={photo.url}
            alt={photo.caption ?? photo.filename}
            fill
            style={{ objectFit: 'contain', borderRadius: 8 }}
            sizes="(max-width: 800px) 100vw, 800px"
            priority
          />
        </div>

        {photo.caption && (
          <Typography.Paragraph style={{ fontSize: 16 }}>{photo.caption}</Typography.Paragraph>
        )}

        <Typography.Text type="secondary">{formatDate(photo.createdAt)}</Typography.Text>

        <Divider />

        <Typography.Title level={4}>Comments ({photo.comments.length})</Typography.Title>

        <CommentList comments={photo.comments} photoId={photo.id} />

        <Divider />

        <CommentForm photoId={photo.id} />
      </Card>
    </div>
  );
}
