// client/src/components/ContentList.tsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, CardActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { apiRequest } from '../api';

interface ContentListProps {
  title: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

const ContentList: React.FC<ContentListProps> = ({ title }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiRequest('/product/list');
        setProducts(data.products);
      } catch (error: unknown) {
        setMessage(error instanceof Error ? error.message : '商材の取得に失敗しました。');
      }
    };
    fetchProducts();
  }, [title]);

  return (
    <Box sx={{ mb: 4, px: isMobile ? 2 : 4 }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
        {title}
      </Typography>
      {message && <Typography variant="body1" color="error">{message}</Typography>}
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
        {products.map((product) => (
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
              image={product.thumbnailUrl}
              alt={product.title}
            />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                {product.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.description.length > 100
                  ? `${product.description.substring(0, 100)}...`
                  : product.description}
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
