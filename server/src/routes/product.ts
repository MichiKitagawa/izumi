// src/routes/product.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import Product from '../models/Product';
import dotenv from 'dotenv';
import path from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// 環境変数のロード
dotenv.config();

const router = Router();

// ファイル名をサニタイズする関数
const sanitizeFilename = (filename: string): string => {
  // ファイル名からディレクトリパスを削除
  const baseName = path.basename(filename);
  // 非ASCII文字をアンダースコアに置換
  return baseName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};

// AWS S3設定
const AWS_S3_REGION = process.env.AWS_S3_REGION;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

if (!AWS_S3_REGION) {
  console.error('Error: AWS_S3_REGION is not defined in environment variables.');
  process.exit(1); // アプリケーションを終了
}

if (!AWS_S3_BUCKET_NAME) {
  console.error('Error: AWS_S3_BUCKET_NAME is not defined in environment variables.');
  process.exit(1); // アプリケーションを終了
}

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: AWS_S3_REGION,
});

// multer設定
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file') {
      const allowedTypes = ['application/pdf', 'video/mp4', 'audio/mpeg'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type for main file.'));
      }
    } else if (file.fieldname === 'thumbnail') {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type for thumbnail.'));
      }
    } else {
      cb(new Error('Unknown field.'));
    }
  },
});

// 商材アップロード
router.post(
  '/upload',
  authenticateToken,
  authorizeRoles('provider', 'editor', 'subscriber'),
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  async (req: Request, res: Response): Promise<void> => {
    console.log('Received upload request'); // デバッグログ
    const { title, description, category } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const file = files && files['file'] ? files['file'][0] : null;
    const thumbnail = files && files['thumbnail'] ? files['thumbnail'][0] : null;

    if (!file) {
      res.status(400).json({ message: 'No main file uploaded.' });
      return;
    }

    if (!thumbnail) {
      res.status(400).json({ message: 'No thumbnail uploaded.' });
      return;
    }

    if (!req.user) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    try {
      // メインファイルのアップロード
      const timestamp = Date.now();
      const sanitizedFileName = sanitizeFilename(file.originalname);
      const fileKey = `${timestamp}_${sanitizedFileName}`;
      const fileParams = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const fileCommand = new PutObjectCommand(fileParams);
      await s3.send(fileCommand);
      const fileUrl = `https://${fileParams.Bucket}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURIComponent(fileParams.Key)}`;

      // サムネイルのアップロード
      const sanitizedThumbnailName = sanitizeFilename(thumbnail.originalname);
      const thumbnailKey = `thumbnails/${timestamp}_${sanitizedThumbnailName}`;
      const thumbnailParams = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnail.buffer,
        ContentType: thumbnail.mimetype,
      };
      const thumbnailCommand = new PutObjectCommand(thumbnailParams);
      await s3.send(thumbnailCommand);
      const thumbnailUrl = `https://${thumbnailParams.Bucket}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURIComponent(thumbnailParams.Key)}`;

      // 商材情報のデータベース保存
      const product = await Product.create({
        title,
        description,
        category,
        fileUrl: fileUrl,
        thumbnailUrl: thumbnailUrl,
        fileType: file.mimetype.split('/')[1],
        fileSize: file.size,
        providerId: req.user.id,
      });

      // デバッグログ
      console.log('Product created:', product);
      console.log('Thumbnail URL:', thumbnailUrl);
      console.log('File URL:', fileUrl);

      res.status(201).json({ message: 'Product uploaded successfully.', product });
    } catch (error) {
      console.error('File upload error:', error);

      // S3アップロードが失敗した場合、データベースへの保存は行われない
      res.status(500).json({ message: 'File upload failed.' });
    }
  });

// 商材一覧取得API
router.get('/list', async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'title', 'description', 'category', 'fileUrl', 'thumbnailUrl', 'fileType', 'fileSize', 'providerId', 'createdAt'],
    });
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '商材一覧の取得に失敗しました。' });
  }
});

// フィーチャー商材取得API
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'description', 'thumbnailUrl'],
    });
    if (!product) {
      return res.status(404).json({ message: 'フィーチャー商材が見つかりませんでした。' });
    }
    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '商材詳細の取得に失敗しました。' });
  }
});

// 商材詳細取得API
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      attributes: ['id', 'title', 'description', 'category', 'fileUrl', 'thumbnailUrl', 'fileType', 'fileSize', 'providerId', 'createdAt'],
    });

    if (!product) {
      return res.status(404).json({ message: '商材が見つかりませんでした。' });
    }

    // メインファイルのプリサインドURLを生成
    const fileObjectKey = product.fileUrl.split('.com/')[1];
    if (!fileObjectKey) {
      return res.status(400).json({ message: 'Invalid file URL.' });
    }
    const fileCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileObjectKey,
    });
    const filePresignedUrl = await getSignedUrl(s3, fileCommand, { expiresIn: 600 }); // 600秒

    // サムネイルのプリサインドURLを生成
    const thumbnailObjectKey = decodeURIComponent(product.thumbnailUrl.split('.com/')[1]);
    const thumbnailCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: thumbnailObjectKey, // 修正済みのオブジェクトキー
    });
    const thumbnailPresignedUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 600 });

    // レスポンスを返す
    res.status(200).json({
      product: {
        ...product.toJSON(),
        fileUrl: filePresignedUrl,
        thumbnailUrl: thumbnailPresignedUrl,
      },
    });
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    res.status(500).json({ message: '商材詳細の取得に失敗しました。' });
  }
});

export default router;
