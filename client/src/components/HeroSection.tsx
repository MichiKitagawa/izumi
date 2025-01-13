// src/components/HeroSection.tsx
import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme, useMediaQuery } from '@mui/material';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        height: isMobile ? '50vh' : '60vh',
        backgroundImage: 'url(/path-to-your-background.jpg)', // 背景画像のパスを指定
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
      }}
    >
      {/* オーバーレイ */}
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: isMobile ? '10px' : '20px',
          borderRadius: '8px',
          width: isMobile ? '90%' : '60%',
        }}
      >
        <Typography variant={isMobile ? 'h4' : 'h3'} gutterBottom>
          {t('注目の商材')}
        </Typography>
        <Typography variant={isMobile ? 'body1' : 'h6'} gutterBottom>
          {t('ここに簡単な説明文を入力します。魅力的な商材を紹介しましょう。')}
        </Typography>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" size={isMobile ? 'medium' : 'large'}>
            {t('視聴する')}
          </Button>
          <Button variant="outlined" color="inherit" size={isMobile ? 'medium' : 'large'}>
            {t('詳細を見る')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default HeroSection;
