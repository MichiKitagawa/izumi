// src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';

const ProductDetail: React.FC = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/${productId}`);
        setProduct(res.data.product);
      } catch (error: any) {
        setMessage(error.response?.data?.message || 'Failed to fetch product.');
      }
    };

    fetchProduct();
  }, [productId]);

  const handleDownload = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/download/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${product.title}.${product.fileType}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setMessage('Download started.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Download failed.');
    }
  };

  if (!product) {
    return (
      <Container>
        <Typography variant="h6">{message || 'Loading...'}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {product.title}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {product.description}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Category: {product.category}
      </Typography>
      <Button variant="contained" color="primary" onClick={handleDownload}>
        Download
      </Button>
      {message && <Typography variant="body1" style={{ marginTop: '10px' }}>{message}</Typography>}
    </Container>
  );
};

export default ProductDetail;
