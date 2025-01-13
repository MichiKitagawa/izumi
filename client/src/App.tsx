// client/src/App.tsx
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, ThemeProvider, CssBaseline } from '@mui/material';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContentList from './components/ContentList';
import AdBanner from './components/AdBanner';
import { useTranslation } from 'react-i18next';
import theme from './theme';
import AuthContext from './context/AuthContext';

const App: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);

  useEffect(() => {
    // 追加の初期化処理があればここに記述
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* ヘッダーコンポーネントにユーザーのロールを渡す */}
      <Header />
      {/* ヒーローセクション */}
      <HeroSection />
      <Box sx={{ padding: { xs: '10px', sm: '20px', md: '40px' } }}>
        {/* コンテンツリスト */}
        <ContentList title={t('あなたにおすすめの商材')} />
        <ContentList title={t('最近見た商材')} />
        <ContentList title={t('人気の商材')} />
      </Box>
      {/* 広告バナー */}
      <AdBanner />
      {/* フッター */}
      <footer
        style={{
          marginTop: '50px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">
          <Link to="/terms">利用規約</Link> | <Link to="/privacy">プライバシーポリシー</Link>
        </Typography>
      </footer>
    </ThemeProvider>
  );
};
export default App;
