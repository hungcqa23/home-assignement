'use client';

import { Form, Input, Button, App } from 'antd';
import { getErrorMessage } from '@/lib';
import { useAddComment } from '../hooks/useAddComment';

interface CommentFormProps {
  photoId: string;
}

interface CommentFormValues {
  content: string;
  author: string;
}

export default function CommentForm({ photoId }: CommentFormProps) {
  const [form] = Form.useForm<CommentFormValues>();
  const addComment = useAddComment(photoId);
  const { message } = App.useApp();

  const handleSubmit = async (values: CommentFormValues) => {
    try {
      await addComment.mutateAsync({
        content: values.content,
        author: values.author || undefined,
      });
      form.resetFields(['content']);
      message.success('Comment added');
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item name="author" label="Name">
        <Input placeholder="Anonymous" maxLength={100} />
      </Form.Item>

      <Form.Item
        name="content"
        label="Comment"
        rules={[{ required: true, message: 'Please enter a comment' }]}
      >
        <Input.TextArea rows={3} placeholder="Write a comment..." maxLength={1000} showCount />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={addComment.isPending}>
          Add Comment
        </Button>
      </Form.Item>
    </Form>
  );
}
