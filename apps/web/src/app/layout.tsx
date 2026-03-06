import React from 'react';
import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AppProvider } from '@/components/layout';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Photo Upload & Comment',
    template: '%s | Photo Upload & Comment',
  },
  description: 'Upload photos and share comments with others',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <AppProvider>{children}</AppProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
