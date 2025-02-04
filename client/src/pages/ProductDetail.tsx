// src/pages/ProductDetail.tsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../api';

// 型定義: 商品のバージョン情報
interface ProductVersion {
  id: number;
  dataType: string; // 'original', 'translation', 'converted-audio', 'converted-video'
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

// 型定義: 商品そのものの情報
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

// サブスクリプション状態管理のためのコンテキストをインポート
import { SubscriptionContext } from '../context/SubscriptionContext';

// 広告付きプレイヤーコンポーネントのインポート（動画、音声、PDF 各種）
import VideoPlayerWithAds from '../components/VideoPlayerWithAds';
import AudioPlayerWithAds from '../components/AudioPlayerWithAds';
import PdfViewerWithAds from '../components/PdfViewerWithAds';

const ProductDetail: React.FC = () => {
  // URL パラメータから商品IDを取得
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  // 商品情報、翻訳結果、読み込み状態などを状態管理
  const [product, setProduct] = useState<Product | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  const [translatedHtmlContent, setTranslatedHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // サブスクリプション状態（プラン情報等）をグローバルコンテキストから取得
  const { subscription, loading: subscriptionLoading } = useContext(SubscriptionContext);

  // サブスクリプション情報がロード完了しており、かつ存在しない場合は購読ページへリダイレクト
  useEffect(() => {
    if (!subscriptionLoading && !subscription) {
      navigate('/subscribe', { replace: true });
    }
  }, [subscription, subscriptionLoading, navigate]);

  // 商品情報を API から取得する処理
  useEffect(() => {
    if (subscriptionLoading) return; // サブスクリプション状態が読み込まれるまで待つ
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
  }, [productId, subscriptionLoading]);

  // 商品が動画の場合、動画再生用の presigned URL を取得する処理
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

  // 翻訳処理: 指定の言語コードに基づいてタイトル・説明・HTMLコンテンツを翻訳
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

  // ダウンロード処理: オリジナルバージョンのダウンロード用 presigned URL を取得してダウンロードを開始
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

  /**
   * renderMediaContent:
   * - 商品情報とそのファイルタイプに基づいて、表示すべきコンテンツを決定する。
   * - サブスクプランが 'Basic' の場合は、広告付きプレイヤーコンポーネント（VideoPlayerWithAds, AudioPlayerWithAds, PdfViewerWithAds）を使用し、
   *   Basic 以外の場合は従来の video/audio タグや HTML 表示を使用する。
   */
  const renderMediaContent = () => {
    if (!product) return null;

    // 変換済みバージョン（翻訳など）がある場合は、そちらを優先的に利用
    const convertedVersion = product.versions?.find(v =>
      v.dataType === 'converted-audio' || v.dataType === 'converted-video'
    );
    const useAdPlayer = subscription && subscription.plan === 'Basic';

    if (convertedVersion && convertedVersion.versionData && convertedVersion.versionData.fileUrl) {
      const convertedUrl = convertedVersion.versionData.fileUrl;
      if (convertedVersion.dataType === 'converted-audio') {
        return useAdPlayer ? (
          <AudioPlayerWithAds audioUrl={convertedUrl} />
        ) : (
          <audio controls style={{ width: '100%' }}>
            <source src={convertedUrl} type="audio/mpeg" />
            お使いのブラウザはオーディオタグに対応していません。
          </audio>
        );
      }
      if (convertedVersion.dataType === 'converted-video') {
        return useAdPlayer ? (
          <VideoPlayerWithAds videoUrl={convertedUrl} />
        ) : (
          <video controls style={{ width: '100%' }}>
            <source src={convertedUrl} type="video/mp4" />
            お使いのブラウザは動画タグに対応していません。
          </video>
        );
      }
    }

    // 商品ファイルの種類に応じた処理
    if (product.fileType === 'mp3') {
      return useAdPlayer ? (
        <AudioPlayerWithAds audioUrl={product.fileUrl} />
      ) : (
        <audio controls style={{ width: '100%' }}>
          <source src={product.fileUrl} type="audio/mpeg" />
          お使いのブラウザはオーディオタグに対応していません。
        </audio>
      );
    }
    if (product.fileType === 'mp4') {
      return useAdPlayer ? (
        videoUrl ? (
          <VideoPlayerWithAds videoUrl={videoUrl} />
        ) : (
          <div>動画を読み込み中...</div>
        )
      ) : (
        videoUrl ? (
          <video controls style={{ width: '100%' }}>
            <source src={videoUrl} type="video/mp4" />
            お使いのブラウザは動画タグに対応していません。
          </video>
        ) : (
          <div>動画を読み込み中...</div>
        )
      );
    }
    // PDFなどの場合
    if (product.fileType === 'pdf') {
      return useAdPlayer ? (
        <PdfViewerWithAds htmlContent={translatedHtmlContent || product.htmlContent || ''} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: translatedHtmlContent || product.htmlContent || '' }} />
      );
    }

    // その他の場合、従来のHTML表示
    return (
      <div dangerouslySetInnerHTML={{ __html: translatedHtmlContent || product.htmlContent || '' }} />
    );
  };

  // 商品情報またはサブスクリプション情報のロード中はローディング表示
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
