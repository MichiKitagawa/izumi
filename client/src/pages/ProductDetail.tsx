import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button } from '@mui/material';
import { API_BASE_URL } from '../api';

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileUrl: string; // プリサインドURLが入る
  thumbnailUrl: string;
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // 商品詳細取得APIからデータを取得（fileUrlはプリサインドURL）
        const res = await axios.get(`${API_BASE_URL}/product/${productId}`);
        setProduct(res.data.product);
      } catch (error: unknown) {
        setMessage('商品情報の取得に失敗しました。');
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleDownload = async () => {
    const token = localStorage.getItem('token');
    try {
      // ダウンロード用プリサインドURLを取得
      const res = await axios.get(`${API_BASE_URL}/download/presigned-url/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { url } = res.data;
      if (url) {
        // ダウンロードを開始
        window.open(url, '_blank');
        setMessage('ダウンロードが開始されました。');
      } else {
        setMessage('ダウンロードURLの取得に失敗しました。');
      }
    } catch (error: unknown) {
      console.error('Download error:', error);
      setMessage('ダウンロードに失敗しました。');
    }
  };

  if (!product) {
    return (
      <Container>
        <Typography variant="h6">{message || '読み込み中...'}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {product.title}
      </Typography>
      {/* サムネイルの表示 */}
      <img
        src={product.thumbnailUrl}
        alt={`${product.title} Thumbnail`}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <Typography variant="body1" gutterBottom>
        {product.description}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        カテゴリ: {product.category}
      </Typography>

      {/* ファイルのプレビュー */}
      {product.fileType === 'pdf' && (
        <embed
          src={product.fileUrl}
          type="application/pdf"
          width="100%"
          height="600px"
        />
      )}
      {product.fileType === 'mp4' && (
        <video controls width="100%">
          <source src={product.fileUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {product.fileType === 'mp3' && (
        <audio controls>
          <source src={product.fileUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {/* ダウンロードボタン */}
      <Button variant="contained" color="primary" onClick={handleDownload} style={{ marginTop: '20px' }}>
        ダウンロード
      </Button>

      {message && <Typography variant="body1" style={{ marginTop: '10px' }}>{message}</Typography>}
    </Container>
  );
};

export default ProductDetail;
