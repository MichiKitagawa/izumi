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
  thumbnailUrl: string;
  htmlContent: string; // HTMLデータを含むフィールド
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  const [translatedHtmlContent, setTranslatedHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // 商材詳細取得APIからデータを取得
        const res = await axios.get(`${API_BASE_URL}/product/${productId}`);
        setProduct(res.data.product);
      } catch (error: unknown) {
        setMessage('商品情報の取得に失敗しました。');
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleTranslate = async (languageCode: string) => {
    if (!product) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/product/${product.id}/translate`, {
        languageCode,
      });
      setTranslatedTitle(res.data.translatedTitle);
      setTranslatedDescription(res.data.translatedDescription);
      setTranslatedHtmlContent(res.data.translatedHtmlContent);
    } catch (error: unknown) {
      setMessage('翻訳に失敗しました。');
      console.error('Translation error:', error);
    } finally {
      setLoading(false);
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
        {translatedTitle || product.title}
      </Typography>
      {/* サムネイルの表示 */}
      <img
        src={product.thumbnailUrl}
        alt={`${product.title} Thumbnail`}
        style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }}
      />
      <Typography variant="body1" gutterBottom>
        {translatedDescription || product.description}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        カテゴリ: {product.category}
      </Typography>

      {/* HTMLコンテンツの表示 */}
      <div
        style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}
        dangerouslySetInnerHTML={{
          __html: translatedHtmlContent || product.htmlContent,
        }}
      />

      {/* 翻訳ボタン */}
      <div style={{ marginTop: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleTranslate('en')}
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          英語に翻訳
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleTranslate('ja')}
          disabled={loading}
        >
          日本語に戻す
        </Button>
      </div>

      {loading && <Typography variant="body1" style={{ marginTop: '10px' }}>翻訳中...</Typography>}
      {message && <Typography variant="body1" style={{ marginTop: '10px', color: 'red' }}>{message}</Typography>}
    </Container>
  );
};
export default ProductDetail;
