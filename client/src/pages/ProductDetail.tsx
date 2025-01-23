// src/pages/ProductDetail.tsx
import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Typography, Button, CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../api';

interface ProductVersion {
  id: number;
  dataType: string;
  languageCode: string;
  versionData: {
    title: string;
    description: string;
    htmlContent: string | null;
  };
  isOriginal: boolean;
}

interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  htmlContent: string;
  versions: ProductVersion[];
  fileType: string; // ファイルタイプを追加
}

interface DownloadedFile {
  id: number;
  title: string;
  fileType: string;
  versionId: number;
  data: string; // Data URL
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // 商材詳細取得APIからデータを取得
        const res = await axios.get(`${API_BASE_URL}/product/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // トークンを追加
          },
        });
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
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // トークンを追加
        },
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

  const handleDownload = async () => {
    if (!product) return;
    setDownloading(true);
    setMessage('');
    try {
      // オリジナルバージョンを取得
      const originalVersion = product.versions.find(v => v.isOriginal);
      if (!originalVersion) {
        throw new Error('オリジナルバージョンが見つかりません。');
      }

      const versionId = originalVersion.id;
      const res = await axios.get(`${API_BASE_URL}/download/presigned-url/${versionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const { url } = res.data;

      // ダウンロードリンクを作成してクリック
      const link = document.createElement('a');
      link.href = url;
      link.download = product.title; // ファイル名を設定
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // ダウンロード履歴をlocalStorageに保存
      const downloadedFiles: DownloadedFile[] = JSON.parse(localStorage.getItem('downloadedFiles') || '[]');
      downloadedFiles.push({
        id: product.id,
        title: product.title,
        fileType: product.fileType || 'unknown', // デフォルト値を設定
        versionId: versionId,
        data: url,
      });
      localStorage.setItem('downloadedFiles', JSON.stringify(downloadedFiles));

      setMessage('ダウンロードが開始されました。');
    } catch (error: unknown) {
      setMessage('ダウンロードに失敗しました。');
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
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

      {/* ダウンロードボタン */}
      <div style={{ marginTop: '20px' }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleDownload}
          disabled={downloading}
        >
          ダウンロード
        </Button>
      </div>

      {(loading || downloading) && <CircularProgress style={{ marginTop: '10px' }} />}
      {message && <Typography variant="body1" style={{ marginTop: '10px', color: 'green' }}>{message}</Typography>}
    </Container>
  );
};

export default ProductDetail;
