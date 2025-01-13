// src/App.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, ThemeProvider, CssBaseline } from '@mui/material';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContentList from './components/ContentList';
import AdBanner from './components/AdBanner';
import { useTranslation } from 'react-i18next';
import theme from './theme';

const App: React.FC = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token');
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (token) {
      const decoded: { role: string } = JSON.parse(atob(token.split('.')[1]));
      setRole(decoded.role);
    }
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header role={role} />
      <HeroSection />
      <Box sx={{ padding: { xs: '10px', sm: '20px', md: '40px' } }}>
        <ContentList title={t('あなたにおすすめの商材')} />
        <ContentList title={t('最近見た商材')} />
        <ContentList title={t('人気の商材')} />
      </Box>
      <AdBanner />
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
