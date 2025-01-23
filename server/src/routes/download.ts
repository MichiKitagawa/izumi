// src/routes/download.ts 
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ProductVersion, DownloadHistory } from '../models'; // models/index.ts からインポート

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

// ユーザーのアクセス権を確認する関数の例
async function checkUserAccess(userId: number, versionId: number): Promise<boolean> {
  // 実装: ユーザーがダウンロード権限を持っているか確認
  // 例: ユーザーが購入済みか、許可された役割を持っているかなど
  // 現在は仮実装として常にtrueを返す
  return true;
}

// プリサインドURL生成エンドポイント
router.get('/presigned-url/:versionId', authenticateToken, async (req: Request, res: Response) => {
  const { versionId } = req.params;
  const userId = (req as AuthenticatedRequest).user.id;

  try {
    const version = await ProductVersion.findByPk(versionId, {
      include: [{ model: ProductVersion.sequelize?.models.Product, as: 'product' }],
    });

    if (!version || !version.product) {
      return res.status(404).json({ message: 'Product version not found.' });
    }

    // ユーザーがこのコンテンツにアクセス権を持っているか確認
    const isAuthorized = await checkUserAccess(userId, version.id);
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // S3オブジェクトキーを抽出
    const fileUrl = version.product.fileUrl;
    if (!fileUrl) {
      return res.status(400).json({ message: 'Invalid file URL.' });
    }

    const objectKey = fileUrl.split('.com/')[1];
    if (!objectKey) {
      return res.status(400).json({ message: 'Invalid file URL format.' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: objectKey,
    });

    // プリサインドURLの生成（有効期限は10分）
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 }); // 600秒 = 10分

    // ダウンロード履歴の記録
    await DownloadHistory.create({
      userId,
      productId: version.product.id,
      versionId: version.id,
      downloadDate: new Date(),
      duration: 0, // 必要に応じて更新
    });

    res.json({ url: presignedUrl });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ message: 'Failed to generate presigned URL.' });
  }
});

export default router;
