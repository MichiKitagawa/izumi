// src/components/HeroSection.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTheme, useMediaQuery } from '@mui/material';
import { apiRequest } from '../api'; // APIリクエスト関数をインポート

interface Product {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        const data = await apiRequest('/product/featured'); // エンドポイントを確認
        setFeaturedProduct(data.product);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setMessage(error.message || '商材の取得に失敗しました。');
        } else {
          setMessage('商材の取得に失敗しました。');
        }
      }
    };
    fetchFeaturedProduct();
  }, []);

  return (
    <Box
      sx={{
        height: isMobile ? '50vh' : '60vh',
        backgroundImage: featuredProduct ? `url(${featuredProduct.thumbnailUrl})` : 'url(/default-background.jpg)',
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
          {featuredProduct ? featuredProduct.title : t('注目の商材')}
        </Typography>
        <Typography variant={isMobile ? 'body1' : 'h6'} gutterBottom>
          {featuredProduct ? featuredProduct.description : t('ここに簡単な説明文を入力します。魅力的な商材を紹介しましょう。')}
        </Typography>
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" size={isMobile ? 'medium' : 'large'}>
            {t('視聴する')}
          </Button>
          <Button variant="outlined" color="inherit" size={isMobile ? 'medium' : 'large'}>
            {t('詳細を見る')}
          </Button>
        </Stack>
        {message && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default HeroSection;
