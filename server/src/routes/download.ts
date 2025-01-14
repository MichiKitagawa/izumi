// server/src/routes/download.ts 
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import Product from '../models/Product';
import DownloadHistory from '../models/DownloadHistory';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const router = Router();

// AuthenticatedRequestインターフェースの定義
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

// AWS S3設定
const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// ダウンロードエンドポイント
router.get('/:productId', authenticateToken, async (req: Request, res: Response) => {
  const { productId } = req.params;
  const userId = (req as AuthenticatedRequest).user.id;
  
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // ダウンロード制限の確認（例: 同時ダウンロード数、期限など）
    // ここでは簡略化のためスキップ

    // S3からファイルを取得
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: product.fileUrl.split('/').pop()!, // ファイル名を取得
    };

    const command = new GetObjectCommand(params);
    const response = await s3.send(command);

    if (!response.Body || !(response.Body instanceof Readable)) {
      throw new Error('Unable to retrieve file stream from S3.');
    }

    const fileStream = response.Body as Readable;

    // 適切なContent-Typeを設定
    const mimeTypes: { [key: string]: string } = {
      pdf: 'application/pdf',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
      // 必要に応じて他のファイルタイプを追加
    };

    const contentType = mimeTypes[product.fileType.toLowerCase()] || 'application/octet-stream';

    res.setHeader('Content-Disposition', `attachment; filename="${product.title}.${product.fileType}"`);
    res.setHeader('Content-Type', contentType);

    // ダウンロード履歴の記録
    await DownloadHistory.create({
      userId,
      productId: product.id,
      downloadDate: new Date(),
      duration: 0, // 初期値、フロントエンドから利用時間を更新する必要あり
    });

    // エラーハンドリング付きでストリームをパイプ
    fileStream.pipe(res).on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).json({ message: 'Download failed during streaming.' });
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Download failed.' });
  }
});

export default router;
