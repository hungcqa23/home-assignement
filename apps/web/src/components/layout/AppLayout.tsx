'use client';

import { Layout, Typography } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Header, Content } = Layout;

export default function AppLayout({ children }: React.PropsWithChildren) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CameraOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Typography.Title level={4} style={{ margin: 0 }}>
            PhotoApp
          </Typography.Title>
        </Link>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {children}
      </Content>
    </Layout>
  );
}
