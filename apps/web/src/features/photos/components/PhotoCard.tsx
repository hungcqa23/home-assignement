'use client';

import { Card, Typography } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import type { Photo } from '@photo-app/shared';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib';

interface PhotoCardProps {
  photo: Photo;
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <Link href={`/photos/${photo.id}`}>
      <Card
        hoverable
        cover={
          <div style={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
            <Image
              src={photo.url}
              alt={photo.caption ?? photo.filename}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        }
      >
        <Card.Meta
          title={photo.caption ?? photo.filename}
          description={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography.Text type="secondary">{formatDate(photo.createdAt)}</Typography.Text>
              <Typography.Text type="secondary">
                <CommentOutlined style={{ marginRight: 4 }} />
                {photo.comments.length}
              </Typography.Text>
            </div>
          }
        />
      </Card>
    </Link>
  );
}
