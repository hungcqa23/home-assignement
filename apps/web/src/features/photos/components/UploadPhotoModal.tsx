'use client';

import { useState } from 'react';
import { Modal, Form, Input, Upload, App } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { getErrorMessage } from '@/lib';
import { useUploadPhoto } from '../hooks/useUploadPhoto';

interface UploadPhotoModalProps {
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

export default function UploadPhotoModal({ open, onClose }: UploadPhotoModalProps) {
  const [form] = Form.useForm<{ caption: string }>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { message } = App.useApp();
  const uploadPhoto = useUploadPhoto();

  const handleSubmit = async () => {
    const file = fileList[0]?.originFileObj;
    if (!file) {
      message.warning('Please select a photo to upload');
      return;
    }

    const values = await form.validateFields();

    try {
      await uploadPhoto.mutateAsync({ file, caption: values.caption || undefined });
      message.success('Photo uploaded successfully');
      handleClose();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title="Upload Photo"
      open={open}
      onOk={handleSubmit}
      onCancel={handleClose}
      okText="Upload"
      confirmLoading={uploadPhoto.isPending}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="Photo" required>
          <Upload.Dragger
            fileList={fileList}
            maxCount={1}
            accept={ACCEPTED_TYPES.join(',')}
            beforeUpload={(file) => {
              if (!ACCEPTED_TYPES.includes(file.type)) {
                message.error('Only JPEG, PNG, GIF, and WebP files are allowed');
                return Upload.LIST_IGNORE;
              }
              if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
                message.error(`File must be smaller than ${MAX_FILE_SIZE_MB}MB`);
                return Upload.LIST_IGNORE;
              }
              setFileList([
                { uid: file.uid, name: file.name, status: 'done', originFileObj: file },
              ]);
              return false;
            }}
            onRemove={() => setFileList([])}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag a photo to upload</p>
            <p className="ant-upload-hint">
              Supports JPEG, PNG, GIF, WebP. Max {MAX_FILE_SIZE_MB}MB.
            </p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item name="caption" label="Caption">
          <Input.TextArea
            rows={2}
            placeholder="Add a caption (optional)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
