'use client';

import { useState } from 'react';
import { Row, Col, Button, Spin, Alert, Empty, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getErrorMessage } from '@/lib';
import { usePhotos } from '../hooks/usePhotos';
import PhotoCard from './PhotoCard';
import UploadPhotoModal from './UploadPhotoModal';

export default function PhotoGallery() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: photos, isLoading, error } = usePhotos();

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
        message="Failed to load photos"
        description={getErrorMessage(error)}
        showIcon
      />
    );
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Photos
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>
          Upload Photo
        </Button>
      </div>

      {photos?.length === 0 ? (
        <Empty description="No photos yet. Upload your first photo!" />
      ) : (
        <Row gutter={[16, 16]}>
          {photos?.map((photo) => (
            <Col key={photo.id} xs={24} sm={12} md={8} lg={6}>
              <PhotoCard photo={photo} />
            </Col>
          ))}
        </Row>
      )}

      <UploadPhotoModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
