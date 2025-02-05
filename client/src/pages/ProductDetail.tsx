// src/pages/ProductDetail.tsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import { API_BASE_URL } from '../api';

// 型定義: 商品のバージョン情報（新しい構造）
interface ProductVersion {
  id: number;
  dataType: string;         // "video", "audio", "text"
  languageCode: string;
  fileUrl: string | null;    // 動画・音声の場合の URL
  fileType: string | null;   // "mp4", "mp3", "pdf"
  htmlContent: string | null; // テキストの場合の HTML
  isOriginal: boolean;
}

// 型定義: 商品そのものの情報
interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  thumbnailUrl: string;
  htmlContent: string | null;
  fileType: string;
  versions?: ProductVersion[];
}

// サブスクリプション状態管理のためのコンテキスト
import { SubscriptionContext } from '../context/SubscriptionContext';

// 広告付きプレイヤーコンポーネントのインポート
import VideoPlayerWithAds from '../components/VideoPlayerWithAds';
import AudioPlayerWithAds from '../components/AudioPlayerWithAds';
import PdfViewerWithAds from '../components/PdfViewerWithAds';

// 利用可能な主要言語（例として7言語）
const availableLanguages = ['ja', 'en', 'es', 'fr', 'de', 'it', 'zh'];

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState('');

  // 動画／音声用 presigned URL 状態
  const [videoStreamUrl, setVideoStreamUrl] = useState<string | null>(null);
  const [audioStreamUrl, setAudioStreamUrl] = useState<string | null>(null);

  // タブ選択状態
  const [selectedMediaType, setSelectedMediaType] = useState<string>('video');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ja');

  const { subscription, loading: subscriptionLoading } = useContext(SubscriptionContext);

  useEffect(() => {
    if (!subscriptionLoading && !subscription) {
      navigate('/subscribe', { replace: true });
    }
  }, [subscription, subscriptionLoading, navigate]);

  useEffect(() => {
    if (subscriptionLoading) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/product/${productId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProduct(res.data.product);
      } catch (error) {
        setMessage('商品情報の取得に失敗しました。');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, subscriptionLoading]);

  // 動画の場合：選択言語に対応する "video" バージョンを取得（converted も original も対象）
  useEffect(() => {
    const fetchVideoStreamUrl = async () => {
      if (product && selectedMediaType === 'video') {
        const videoVersion = product.versions?.find(
          (v) =>
            v.dataType === 'video' && v.languageCode === selectedLanguage
        );
        if (videoVersion && videoVersion.fileUrl) {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/download/presigned-url/${videoVersion.id}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setVideoStreamUrl(res.data.url);
          } catch (error) {
            console.error('Error fetching video presigned URL:', error);
            setVideoStreamUrl(null);
          }
        } else {
          setVideoStreamUrl(null);
        }
      }
    };
    fetchVideoStreamUrl();
  }, [product, selectedMediaType, selectedLanguage]);

  // 音声の場合：選択言語に対応する "audio" バージョンを取得
  useEffect(() => {
    const fetchAudioStreamUrl = async () => {
      if (product && selectedMediaType === 'audio') {
        const audioVersion = product.versions?.find(
          (v) =>
            v.dataType === 'audio' && v.languageCode === selectedLanguage
        );
        if (audioVersion && audioVersion.fileUrl) {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/download/presigned-url/${audioVersion.id}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setAudioStreamUrl(res.data.url);
          } catch (error) {
            console.error('Error fetching audio presigned URL:', error);
            setAudioStreamUrl(null);
          }
        } else {
          setAudioStreamUrl(null);
        }
      }
    };
    fetchAudioStreamUrl();
  }, [product, selectedMediaType, selectedLanguage]);

  const handleMediaTypeChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedMediaType(newValue);
    setVideoStreamUrl(null);
    setAudioStreamUrl(null);
  };

  const handleLanguageChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedLanguage(newValue);
    setVideoStreamUrl(null);
    setAudioStreamUrl(null);
  };

  const renderMediaContent = () => {
    if (!product) return null;
    const useAdPlayer = subscription && subscription.plan === 'Basic';

    if (selectedMediaType === 'video') {
      if (!videoStreamUrl) {
        return <Typography>動画が見つかりません。</Typography>;
      }
      return useAdPlayer ? (
        <VideoPlayerWithAds videoUrl={videoStreamUrl} />
      ) : (
        <video controls style={{ width: '100%' }}>
          <source src={videoStreamUrl} type="video/mp4" />
          お使いのブラウザは動画タグに対応していません。
        </video>
      );
    }

    if (selectedMediaType === 'audio') {
      if (!audioStreamUrl) {
        return <Typography>音声が見つかりません。</Typography>;
      }
      return useAdPlayer ? (
        <AudioPlayerWithAds audioUrl={audioStreamUrl} />
      ) : (
        <audio controls style={{ width: '100%' }}>
          <source src={audioStreamUrl} type="audio/mpeg" />
          お使いのブラウザはオーディオタグに対応していません。
        </audio>
      );
    }

    if (selectedMediaType === 'text') {
      // テキストの場合は、該当する "text" バージョンのみを表示
      const textVersion = product.versions?.find(
        (v) => v.dataType === 'text' && v.languageCode === selectedLanguage
      );
      const htmlContent = textVersion?.htmlContent || '';
      if (!htmlContent) return <Typography>テキストが見つかりません。</Typography>;
      // PDFの場合（アップロード時が PDF の場合）は PdfViewerWithAds を利用
      if (product.fileType === 'pdf') {
        return useAdPlayer ? (
          <PdfViewerWithAds htmlContent={htmlContent} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        );
      }
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }
    return null;
  };

  if (subscriptionLoading || !product) {
    return (
      <Container>
        <Typography variant="h6">読み込み中...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {product.title}
      </Typography>
      {product.thumbnailUrl && (
        <img
          src={product.thumbnailUrl}
          alt={`${product.title} Thumbnail`}
          style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }}
        />
      )}
      <Typography variant="body1" gutterBottom>
        {product.description}
      </Typography>

      {/* 商材型タブ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs value={selectedMediaType} onChange={handleMediaTypeChange} variant="fullWidth">
          <Tab value="video" label="動画" />
          <Tab value="audio" label="音声" />
          <Tab value="text" label="テキスト" />
        </Tabs>
      </Box>

      {/* 言語タブ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
        <Tabs value={selectedLanguage} onChange={handleLanguageChange} variant="scrollable" scrollButtons="auto">
          {availableLanguages.map((lang) => (
            <Tab key={lang} value={lang} label={lang.toUpperCase()} />
          ))}
        </Tabs>
      </Box>

      {/* メインコンテンツ表示エリア */}
      <Box sx={{ mt: 2 }}>{renderMediaContent()}</Box>

      {/* ダウンロードボタン */}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={async () => {
            try {
              const originalVersion = product.versions?.find((v) => v.isOriginal);
              if (!originalVersion) throw new Error('オリジナルバージョンが見つかりません。');
              const res = await axios.get(
                `${API_BASE_URL}/download/presigned-url/${originalVersion.id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );
              const { url } = res.data;
              const link = document.createElement('a');
              link.href = url;
              link.download = product.title;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (error) {
              setMessage('ダウンロードに失敗しました。');
              console.error('Download error:', error);
            }
          }}
        >
          ダウンロード
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {message && (
        <Typography variant="body1" sx={{ mt: 2, color: 'green' }}>
          {message}
        </Typography>
      )}
    </Container>
  );
};

export default ProductDetail;
