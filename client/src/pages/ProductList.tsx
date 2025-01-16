// src/pages/ProductList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const ProductList: React.FC = () => {
  interface Product {
    id: string;
    title: string;
    description: string;
    fileType: string;
    thumbnailUrl: string;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<{ products: Product[] }>('/api/product/list');
        setProducts(res.data.products);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          setMessage(error.response.data?.message || '商材の取得に失敗しました。');
        } else {
          setMessage('商材の取得に失敗しました。');
        }
      }
    };

    fetchProducts();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        商材一覧
      </Typography>
      {message && <Typography variant="body1">{message}</Typography>}
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              {product.thumbnailUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={product.thumbnailUrl}
                  alt={product.title}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description}
                </Typography>
                <Button
                  component={Link}
                  to={`/product/${product.id}`}
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '10px' }}
                >
                  詳細を見る
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList;
