// src/routes/download.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import Product from '../models/Product';
import DownloadHistory from '../models/DownloadHistory';
import AWS from 'aws-sdk';

const router = Router();

// AWS S3設定
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

// ダウンロードエンドポイント
router.get('/:productId', authenticateToken, async (req: Request, res: Response) => {
  const { productId } = req.params;
  const userId = req.user.id;

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

    const fileStream = s3.getObject(params).createReadStream();
    res.setHeader('Content-Disposition', `attachment; filename="${product.title}.${product.fileType}"`);
    res.setHeader('Content-Type', product.fileType === 'pdf' ? 'application/pdf' : product.fileType === 'mp4' ? 'video/mp4' : 'audio/mpeg');

    // ダウンロード履歴の記録
    const downloadHistory = await DownloadHistory.create({
      userId,
      productId: product.id,
      downloadDate: new Date(),
      duration: 0, // 初期値、フロントエンドから利用時間を更新する必要あり
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Download failed.' });
  }
});

export default router;
