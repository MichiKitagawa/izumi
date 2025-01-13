// src/components/ContentList.tsx
import React from 'react';
import { Box, Typography, Card, CardMedia, CardContent, CardActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';

interface ContentListProps {
  title: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
}

const mockProducts: Product[] = [
  {
    id: '1',
    title: '商材1',
    description: '商材1の説明',
    image: '/path-to-image1.jpg',
  },
  {
    id: '2',
    title: '商材2',
    description: '商材2の説明',
    image: '/path-to-image2.jpg',
  },
  // 追加の商材データ
];

const ContentList: React.FC<ContentListProps> = ({ title }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ mb: 4, px: isMobile ? 2 : 4 }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          p: 1,
          '&::-webkit-scrollbar': { display: 'none' },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        }}
      >
        {mockProducts.map((product) => (
          <Card
            key={product.id}
            sx={{
              minWidth: isMobile ? 150 : 200,
              flex: '0 0 auto',
              borderRadius: '8px',
              boxShadow: 3,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <CardMedia
              component="img"
              height={isMobile ? '100' : '140'}
              image={product.image}
              alt={product.title}
            />
            <CardContent>
              <Typography gutterBottom variant={isMobile ? 'h6' : 'h6'} component="div">
                {product.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size={isMobile ? 'small' : 'medium'} component={Link} to={`/product/${product.id}`}>
                {t('詳細を見る')}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ContentList;
