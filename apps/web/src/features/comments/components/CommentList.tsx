'use client';

import { List, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Comment } from '@photo-app/shared';
import { formatDate } from '@/lib';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
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
        <List.Item>
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
