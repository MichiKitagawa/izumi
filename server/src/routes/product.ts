// src/routes/product.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import Product from '../models/Product';

const router = Router();

// AWS S3設定
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AWS_ACCESS_KEY_ID',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'AWS_SECRET_ACCESS_KEY',
  },
  region: process.env.AWS_S3_REGION || 'AWS_REGION',
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
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), // 複数ファイル対応
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
      const fileParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'S3_BUCKET_NAME',
        Key: `${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const fileCommand = new PutObjectCommand(fileParams);
      await s3.send(fileCommand);
      const fileUrl = `https://${fileParams.Bucket}.s3.${s3.config.region}.amazonaws.com/${fileParams.Key}`;

      // サムネイルのアップロード
      const thumbnailParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'S3_BUCKET_NAME',
        Key: `thumbnails/${Date.now()}_${thumbnail.originalname}`,
        Body: thumbnail.buffer,
        ContentType: thumbnail.mimetype,
      };
      const thumbnailCommand = new PutObjectCommand(thumbnailParams);
      await s3.send(thumbnailCommand);
      const thumbnailUrl = `https://${thumbnailParams.Bucket}.s3.${s3.config.region}.amazonaws.com/${thumbnailParams.Key}`;

      // 商材情報のデータベース保存
      const product = await Product.create({
        title,
        description,
        category,
        fileUrl: fileUrl,
        thumbnailUrl: thumbnailUrl, // サムネイルURLを保存
        fileType: file.mimetype.split('/')[1],
        fileSize: file.size,
        providerId: req.user.id,
      });

      res.status(201).json({ message: 'Product uploaded successfully.', product });
    } catch (error) {
      console.error(error);
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
    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '商材詳細の取得に失敗しました。' });
  }
});

export default router;
