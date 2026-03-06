'use client';

import { List, Typography, Button, Popconfirm, App } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Comment } from '@photo-app/shared';
import { formatDate, getErrorMessage } from '@/lib';
import { useDeleteComment } from '../hooks/useDeleteComment';

interface CommentListProps {
  comments: Comment[];
  photoId: string;
}

export default function CommentList({ comments, photoId }: CommentListProps) {
  const deleteComment = useDeleteComment(photoId);
  const { message } = App.useApp();

  if (comments.length === 0) {
    return (
      <Typography.Text type="secondary" style={{ display: 'block', padding: '16px 0' }}>
        No comments yet. Be the first to comment!
      </Typography.Text>
    );
  }

  return (
    <List
      dataSource={comments}
      itemLayout="horizontal"
      renderItem={(comment) => (
        <List.Item
          actions={[
            <Popconfirm
              key="delete"
              title="Delete comment?"
              onConfirm={async () => {
                try {
                  await deleteComment.mutateAsync(comment.id);
                  message.success('Comment deleted');
                } catch (err) {
                  message.error(getErrorMessage(err));
                }
              }}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            avatar={<UserOutlined style={{ fontSize: 20, color: '#999' }} />}
            title={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography.Text strong>{comment.author ?? 'Anonymous'}</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {formatDate(comment.createdAt)}
                </Typography.Text>
              </div>
            }
            description={comment.content}
          />
        </List.Item>
      )}
    />
  );
}
