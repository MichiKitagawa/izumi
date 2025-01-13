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
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'YOUR_AWS_ACCESS_KEY_ID',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_AWS_SECRET_ACCESS_KEY',
  },
  region: process.env.AWS_REGION || 'YOUR_AWS_REGION',
});

// multer設定
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'video/mp4', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'));
    }
  },
});

// 商材アップロード
router.post(
  '/upload',
  authenticateToken,
  authorizeRoles('provider'),
  upload.single('file'),
  async (req: Request & { user?: { id: number } }, res: Response): Promise<void> => { // id を number に変更
    const { title, description, category } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    }

    if (!req.user) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    // S3にファイルをアップロード
    const params = {
      Bucket: process.env.S3_BUCKET_NAME || 'YOUR_S3_BUCKET_NAME',
      Key: `${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await s3.send(command);

      // S3のファイルURLを生成
      const fileUrl = `http://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${params.Key}`;

      // 商材情報のデータベース保存
      const product = await Product.create({
        title,
        description,
        category,
        fileUrl: fileUrl,
        fileType: file.mimetype.split('/')[1],
        fileSize: file.size,
        providerId: req.user.id, // number 型として扱う
      });

      res.status(201).json({ message: 'Product uploaded successfully.', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'File upload failed.' });
    }
  }
);

// 商材一覧取得API
router.get('/list', async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'title', 'description', 'category', 'fileUrl', 'fileType', 'fileSize', 'providerId', 'createdAt'],
    });
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '商材一覧の取得に失敗しました。' });
  }
});

// 商材詳細取得API
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id, {
      attributes: ['id', 'title', 'description', 'category', 'fileUrl', 'fileType', 'fileSize', 'providerId', 'createdAt'],
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
