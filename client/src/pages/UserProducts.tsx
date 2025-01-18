import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardMedia, CardContent, CardActions, Button } from '@mui/material';
import { apiRequest } from '../api';

interface Product {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  createdAt: string;
}

const UserProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const data = await apiRequest('/product/user-products');
        setProducts(data.products);
      } catch (error: unknown) {
        console.error(error);
        setMessage('商材一覧の取得に失敗しました。');
      }
    };
    fetchUserProducts();
  }, []);

  const handleDelete = async (productId: number) => {
    if (window.confirm('本当にこの商材を削除しますか？')) {
      try {
        await apiRequest(`/product/${productId}`, { method: 'DELETE' });
        setProducts((prev) => prev.filter((product) => product.id !== productId));
        alert('商材を削除しました。');
      } catch (error: unknown) {
        console.error(error);
        alert('商材の削除に失敗しました。');
      }
    }
  };
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        アップロードした商材一覧
      </Typography>
      {message && <Typography color="error">{message}</Typography>}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        {products.map((product) => (
          <Card key={product.id} sx={{ width: 300 }}>
            <CardMedia
              component="img"
              height="140"
              image={product.thumbnailUrl}
              alt={product.title}
            />
            <CardContent>
              <Typography variant="h6">{product.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {product.description.length > 100
                  ? `${product.description.substring(0, 100)}...`
                  : product.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="error"
                onClick={() => handleDelete(product.id)}
              >
                削除
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default UserProducts;
