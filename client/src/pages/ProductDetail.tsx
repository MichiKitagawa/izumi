// client/src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../api';

interface ProductVersion {
  id: number;
  dataType: string; // 例: 'original', 'translation', 'converted-audio', 'converted-video'
  languageCode: string;
  versionData: {
    fileUrl?: string;
    fileType?: string;
    title?: string;
    description?: string;
    htmlContent?: string | null;
  };
  isOriginal: boolean;
}

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  thumbnailUrl: string;
  htmlContent: string | null;
  fileType: string; // 'pdf', 'mp4', 'mp3'
  versions?: ProductVersion[];
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  const [translatedHtmlContent, setTranslatedHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/subscription/status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.data.active) {
          navigate('/subscribe', { replace: true });
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        navigate('/subscribe', { replace: true });
      } finally {
        setSubscriptionChecked(true);
      }
    };
    checkSubscription();
  }, [navigate]);

  useEffect(() => {
    if (!subscriptionChecked) return;
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/product/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProduct(res.data.product);
      } catch (error) {
        setMessage('商品情報の取得に失敗しました。');
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [productId, subscriptionChecked]);

  // 追加: mp4の場合、動画再生用のpresigned URLを取得する
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        if (product && product.fileType === 'mp4') {
          const res = await axios.get(`${API_BASE_URL}/product/stream/${product.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setVideoUrl(res.data.presignedUrl);
        }
      } catch (error) {
        console.error('Error fetching video presigned URL:', error);
      }
    };
    fetchVideoUrl();
  }, [product]);

  const handleTranslate = async (languageCode: string) => {
    if (!product) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(
        `${API_BASE_URL}/product/${product.id}/translate`,
        { languageCode },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTranslatedTitle(res.data.translatedTitle);
      setTranslatedDescription(res.data.translatedDescription);
      setTranslatedHtmlContent(res.data.translatedHtmlContent);
    } catch (error) {
      setMessage('翻訳に失敗しました。');
      console.error('Translation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!product) return;
    setDownloading(true);
    setMessage('');
    try {
      const originalVersion = product.versions?.find(v => v.isOriginal);
      if (!originalVersion) throw new Error('オリジナルバージョンが見つかりません。');
      const versionId = originalVersion.id;
      const res = await axios.get(`${API_BASE_URL}/download/presigned-url/${versionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const { url } = res.data;
      const link = document.createElement('a');
      link.href = url;
      link.download = product.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage('ダウンロードが開始されました。');
    } catch (error) {
      setMessage('ダウンロードに失敗しました。');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const renderMediaContent = () => {
    if (!product) return null;
    const convertedVersion = product.versions?.find(v =>
      v.dataType === 'converted-audio' || v.dataType === 'converted-video'
    );
    if (convertedVersion && convertedVersion.versionData && 'fileUrl' in convertedVersion.versionData) {
      const convertedUrl = convertedVersion.versionData.fileUrl;
      if (convertedVersion.dataType === 'converted-audio') {
        return (
          <audio controls style={{ width: '100%' }}>
            <source src={convertedUrl} type="audio/mpeg" />
            お使いのブラウザはオーディオタグに対応していません。
          </audio>
        );
      }
      if (convertedVersion.dataType === 'converted-video') {
        return (
          <video controls style={{ width: '100%' }}>
            <source src={convertedUrl} type="video/mp4" />
            お使いのブラウザは動画タグに対応していません。
          </video>
        );
      }
    }
    if (product.fileType === 'mp3') {
      return (
        <audio controls style={{ width: '100%' }}>
          <source src={product.fileUrl} type="audio/mpeg" />
          お使いのブラウザはオーディオタグに対応していません。
        </audio>
      );
    }
    if (product.fileType === 'mp4') {
      return videoUrl ? (
        <video controls style={{ width: '100%' }}>
          <source src={videoUrl} type="video/mp4" />
          お使いのブラウザは動画タグに対応していません。
        </video>
      ) : (
        <div>動画を読み込み中...</div>
      );
    }
    return (
      <div dangerouslySetInnerHTML={{ __html: translatedHtmlContent || product.htmlContent || '' }} />
    );
  };

  if (!subscriptionChecked || !product) {
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
      {product.thumbnailUrl && (
        <img
          src={product.thumbnailUrl}
          alt={`${product.title} Thumbnail`}
          style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }}
        />
      )}
      <Typography variant="body1" gutterBottom>
        {translatedDescription || product.description}
      </Typography>
      <div style={{ marginTop: '20px' }}>{renderMediaContent()}</div>
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
      <div style={{ marginTop: '20px' }}>
        <Button variant="contained" color="success" onClick={handleDownload} disabled={downloading}>
          ダウンロード
        </Button>
      </div>
      {(loading || downloading) && <CircularProgress style={{ marginTop: '10px' }} />}
      {message && (
        <Typography variant="body1" style={{ marginTop: '10px', color: 'green' }}>
          {message}
        </Typography>
      )}
    </Container>
  );
};

export default ProductDetail;
