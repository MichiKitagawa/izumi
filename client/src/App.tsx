// src/App.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import theme from './theme';

// サブスクリプション状態管理と外部広告ネットワーク初期化のためのコンポーネントをインポート
import { SubscriptionProvider } from './context/SubscriptionProvider';
import ExternalAdManager from './components/ExternalAdManager';

const App: React.FC = () => {
  return (
    // 全画面でサブスクリプション状態と外部広告ネットワークを利用できるようにラップ
    <SubscriptionProvider>
      <ExternalAdManager />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header />
        <Box sx={{ padding: { xs: '10px', sm: '20px', md: '40px' }, paddingBottom: '60px' }}>
          <Outlet /> {/* 子ルートのコンテンツがここにレンダリングされる */}
        </Box>
        <BottomNav />
      </ThemeProvider>
    </SubscriptionProvider>
  );
};

export default App;
