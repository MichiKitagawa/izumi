// client/src/pages/WelcomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '100px' }}>
      {/* izumiのロゴや魅力の表示 */}
      <Typography variant="h3" gutterBottom>
        Izumi
      </Typography>
      <Typography variant="h6" gutterBottom>
        {t('Discover and share the best products!')}
      </Typography>
      <Box mt={4}>
        {/* ログインボタン */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          style={{ marginRight: '20px' }}
        >
          {t('Login')}
        </Button>
        {/* 新規登録ボタン */}
        <Button variant="outlined" color="primary" onClick={handleRegister}>
          {t('Register')}
        </Button>
      </Box>
    </Container>
  );
};

export default WelcomePage;
