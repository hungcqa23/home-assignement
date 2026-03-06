'use client';

import { App, ConfigProvider, theme } from 'antd';
import QueryProvider from './QueryProvider';

export default function AppProvider({ children }: React.PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <App>
        <QueryProvider>{children}</QueryProvider>
      </App>
    </ConfigProvider>
  );
}
