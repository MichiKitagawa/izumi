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
import AIConvertModal from '../components/AIConvertModal';

// 既存の SubscriptionContext を正しくインポートする
import { SubscriptionContext } from '../context/SubscriptionContext';

// 型定義：ProductVersion
interface ProductVersion {
  id: number;
  dataType: 'video' | 'audio' | 'text';
  languageCode: string;
  fileUrl: string | null;
  fileType: string | null;
  htmlContent: string | null;
  isOriginal: boolean;
}

// 型定義：Product
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

// ダミーのプレイヤーコンポーネント（各自実装済みのものを利用）
const VideoPlayerWithAds: React.FC<{ videoUrl: string }> = ({ videoUrl }) => (
  <video controls style={{ width: '100%' }}>
    <source src={videoUrl} type="video/mp4" />
    ブラウザが動画タグに対応していません。
  </video>
);
const AudioPlayerWithAds: React.FC<{ audioUrl: string }> = ({ audioUrl }) => (
  <audio controls style={{ width: '100%' }}>
    <source src={audioUrl} type="audio/mpeg" />
    ブラウザがオーディオタグに対応していません。
  </audio>
);

// PDF表示コンポーネント（iframe を利用）
const PdfViewerWithAds: React.FC<{ htmlContentUrl: string }> = ({ htmlContentUrl }) => (
  <iframe
    src={htmlContentUrl}
    style={{ width: '100%', height: '600px', border: 'none' }}
    title="PDF Converted HTML"
  />
);

// 利用可能な主要言語
const availableLanguages = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: '英語' },
  { value: 'es', label: 'スペイン語' },
  { value: 'fr', label: 'フランス語' },
  { value: 'de', label: 'ドイツ語' },
  { value: 'it', label: 'イタリア語' },
  { value: 'zh', label: '中国語' },
];

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [videoStreamUrl, setVideoStreamUrl] = useState<string | null>(null);
  const [audioStreamUrl, setAudioStreamUrl] = useState<string | null>(null);
  // テキスト（HTML）のプレサインドURL
  const [textStreamUrl, setTextStreamUrl] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'video' | 'audio' | 'text'>('video');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ja');
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);

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

  // 動画の場合のプレサインドURL取得
  useEffect(() => {
    const fetchVideoStreamUrl = async () => {
      if (product && selectedMediaType === 'video') {
        const videoVersion = product.versions?.find(
          (v: ProductVersion) => v.dataType === 'video' && v.languageCode === selectedLanguage
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

  // 音声の場合のプレサインドURL取得
  useEffect(() => {
    const fetchAudioStreamUrl = async () => {
      if (product && selectedMediaType === 'audio') {
        const audioVersion = product.versions?.find(
          (v: ProductVersion) => v.dataType === 'audio' && v.languageCode === selectedLanguage
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

  // テキスト（HTML、PDF変換後）の場合のプレサインドURL取得
  useEffect(() => {
    const fetchTextStreamUrl = async () => {
      if (product && selectedMediaType === 'text' && product.fileType === 'pdf') {
        const textVersion = product.versions?.find(
          (v: ProductVersion) => v.dataType === 'text' && v.languageCode === selectedLanguage
        );
        if (textVersion && textVersion.htmlContent) {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/download/presigned-url/${textVersion.id}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setTextStreamUrl(res.data.url);
          } catch (error) {
            console.error('Error fetching text (HTML) presigned URL:', error);
            setTextStreamUrl(null);
          }
        } else {
          setTextStreamUrl(null);
        }
      }
    };
    fetchTextStreamUrl();
  }, [product, selectedMediaType, selectedLanguage]);

  const handleMediaTypeChange = (_: React.SyntheticEvent, newValue: 'video' | 'audio' | 'text') => {
    setSelectedMediaType(newValue);
    setVideoStreamUrl(null);
    setAudioStreamUrl(null);
    setTextStreamUrl(null);
  };

  const handleLanguageChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedLanguage(newValue);
    setVideoStreamUrl(null);
    setAudioStreamUrl(null);
    setTextStreamUrl(null);
  };

  const handleConversionComplete = (convertedResult: unknown) => {
    setProduct((prev: Product | null): Product | null => {
      if (!prev) return prev;
      return {
        ...prev,
        versions: [...(prev.versions || []), convertedResult as ProductVersion],
      };
    });
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
      if (product.fileType === 'pdf') {
        if (!textStreamUrl) return <Typography>テキスト(HTML)が見つかりません。</Typography>;
        return useAdPlayer ? (
          <PdfViewerWithAds htmlContentUrl={textStreamUrl} />
        ) : (
          <iframe
            src={textStreamUrl}
            style={{ width: '100%', height: '600px', border: 'none' }}
            title="PDF Converted HTML"
          />
        );
      }
      // PDF以外の場合は、既存のhtmlContentを直接レンダリング
      const textVersion = product.versions?.find(
        (v: ProductVersion) => v.dataType === 'text' && v.languageCode === selectedLanguage
      );
      const htmlContent = textVersion?.htmlContent || '';
      if (!htmlContent) return <Typography>テキストが見つかりません。</Typography>;
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

      {/* AI機能ボタン */}
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={() => setAiModalOpen(true)}>
          AI機能
        </Button>
      </Box>

      {/* AI変換モーダル */}
      <AIConvertModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        productId={productId!}
        onConversionComplete={handleConversionComplete}
      />

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
        <Tabs
          value={selectedLanguage}
          onChange={handleLanguageChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {availableLanguages.map((lang) => (
            <Tab key={lang.value} value={lang.value} label={lang.label} />
          ))}
        </Tabs>
      </Box>

      {/* メインコンテンツ表示エリア */}
      <Box sx={{ mt: 2 }}>{renderMediaContent()}</Box>

      {/* ダウンロードボタン (既存コード) */}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={async () => {
            try {
              const originalVersion = product.versions?.find((v: ProductVersion) => v.isOriginal);
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
