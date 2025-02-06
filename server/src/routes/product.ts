// server/src/routes/product.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import { Product, ProductVersion } from '../models';
import dotenv from 'dotenv';
import * as path from 'path';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import checkSubscription from '../middleware/checkSubscription';

import { promisify } from 'util';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';

import { convertPdfToHtml } from '../utils/convertPdfToHtml';

dotenv.config();

const router = Router();

// ファイル名のサニタイズ関数
const sanitizeFilename = (filename: string): string => {
  const baseName = path.basename(filename);
  return baseName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
};

const AWS_S3_REGION = process.env.AWS_S3_REGION;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
if (!AWS_S3_REGION) {
  console.error('Error: AWS_S3_REGION is not defined in environment variables.');
  process.exit(1);
}
if (!AWS_S3_BUCKET_NAME) {
  console.error('Error: AWS_S3_BUCKET_NAME is not defined in environment variables.');
  process.exit(1);
}

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: AWS_S3_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
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

// ルート: 商品アップロード（ファイルとサムネイルのアップロード、PDF の変換、DB 登録）
router.post(
  '/upload',
  authenticateToken,
  authorizeRoles('provider', 'editor', 'subscriber'),
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  async (req: Request, res: Response): Promise<void> => {
    console.log('Received upload request');
    const { title, description, category } = req.body;
    // アップロード時の言語（デフォルトはja）
    const language = req.body.language || 'ja';

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
      const timestamp = Date.now();
      const sanitizedFileName = sanitizeFilename(file.originalname);
      let fileUrl: string = '';
      let htmlContent: string | null = null;

      if (file.mimetype === 'application/pdf') {
        // PDFの場合は、オリジナルPDFは S3 にアップロードせず、直接 HTML に変換してアップロードする
        const tmpDir = os.tmpdir();
        // 変換後の HTML 一時ファイルパスを指定
        const htmlTempPath = path.join(tmpDir, `${timestamp}_converted.html`);
        // convertPdfToHtml 関数を呼び出して変換を実施
        const convertedHtml = await convertPdfToHtml(file.buffer, htmlTempPath);
        
        // 変換後の HTML を Buffer 化して S3 にアップロード
        const htmlBuffer = Buffer.from(convertedHtml, 'utf8');
        const htmlKey = `converted_html/${timestamp}_${sanitizedFileName.split('.')[0]}_converted.html`;
        const htmlParams = {
          Bucket: AWS_S3_BUCKET_NAME,
          Key: htmlKey,
          Body: htmlBuffer,
          ContentType: 'text/html',
        };
        const htmlCommand = new PutObjectCommand(htmlParams);
        await s3.send(htmlCommand);
        // 変換後の HTML の URL を生成
        fileUrl = `https://${htmlParams.Bucket}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURIComponent(htmlParams.Key)}`;
        // 保存する値として HTML コンテンツの URL を設定
        htmlContent = fileUrl;
      } else {
        // 動画や音声の場合は、従来通りオリジナルファイルを S3 にアップロードする
        const fileKey = `${timestamp}_${sanitizedFileName}`;
        const fileParams = {
          Bucket: AWS_S3_BUCKET_NAME,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const fileCommand = new PutObjectCommand(fileParams);
        await s3.send(fileCommand);
        fileUrl = `https://${fileParams.Bucket}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURIComponent(fileParams.Key)}`;
      }

      // サムネイルのアップロード（共通処理）
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

      // MIME タイプに基づく dataType と fileType の設定
      let normalizedFileType = file.mimetype.split('/')[1];
      let normalizedDataType = '';
      if (file.mimetype.startsWith('video/')) {
        normalizedDataType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        normalizedDataType = 'audio';
        if (file.mimetype === 'audio/mpeg') {
          normalizedFileType = 'mp3';
        }
      } else if (file.mimetype === 'application/pdf') {
        normalizedDataType = 'text';
      } else {
        throw new Error('Unsupported file type.');
      }

      // 商品基本情報登録（PDFの場合は fileUrl に変換後 HTML の URL が登録される）
      const product = await Product.create({
        title,
        description,
        category,
        fileUrl: fileUrl,
        thumbnailUrl: thumbnailUrl,
        fileType: normalizedFileType,
        fileSize: file.size,
        providerId: req.user.id,
        htmlContent, // PDFの場合は変換後 HTML の URL
      });

      // 商品バージョン登録（オリジナル）
      await ProductVersion.create({
        productId: product.id,
        dataType: normalizedDataType, // "video", "audio", "text"
        languageCode: language,       // クライアントから送信された言語
        fileUrl: product.fileUrl,
        fileType: product.fileType,
        htmlContent, // PDFの場合は変換後 HTML の URL
        isOriginal: true,
      });

      res.status(201).json({ message: 'Product uploaded successfully.', product });
    } catch (error) {
      console.error('File upload or conversion error:', error);
      res.status(500).json({ message: 'File upload failed.' });
    }
  }
);

// 以下、既存の GET ルート等はそのまま利用

router.get('/list', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'title', 'description', 'thumbnailUrl'],
    });
    const productsWithPresignedUrls = await Promise.all(
      products.map(async (product) => {
        try {
          if (!product.thumbnailUrl) {
            console.warn(`Product with ID ${product.id} has no thumbnail URL.`);
            return { ...product.toJSON(), thumbnailUrl: null };
          }
          const thumbnailObjectKey = decodeURIComponent(product.thumbnailUrl.split('.com/')[1]);
          const thumbnailCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: thumbnailObjectKey,
          });
          const thumbnailPresignedUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 600 });
          return { ...product.toJSON(), thumbnailUrl: thumbnailPresignedUrl };
        } catch (err) {
          console.error(`Error generating presigned URL for product ID ${product.id}:`, err);
          return { ...product.toJSON(), thumbnailUrl: null };
        }
      })
    );
    res.status(200).json({ products: productsWithPresignedUrls });
  } catch (error) {
    console.error('Error fetching product list:', error);
    res.status(500).json({ message: '商材一覧の取得に失敗しました。' });
  }
});

router.get('/featured', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'description', 'thumbnailUrl'],
    });
    if (!product) {
      res.status(404).json({ message: 'フィーチャー商材が見つかりませんでした。' });
      return;
    }
    if (!product.thumbnailUrl) {
      res.status(400).json({ message: 'Thumbnail URL is missing.' });
      return;
    }
    const thumbnailObjectKey = decodeURIComponent(product.thumbnailUrl.split('.com/')[1]);
    const thumbnailCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: thumbnailObjectKey,
    });
    const thumbnailPresignedUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 600 });
    res.status(200).json({
      product: {
        ...product.toJSON(),
        thumbnailUrl: thumbnailPresignedUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '商材詳細の取得に失敗しました。' });
  }
});

router.get('/user-products', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const products = await Product.findAll({
      where: { providerId: userId },
      attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'],
    });
    const productsWithPresignedUrls = await Promise.all(
      products.map(async (product) => {
        if (!product.thumbnailUrl) {
          return { ...product.toJSON(), thumbnailUrl: null };
        }
        try {
          const thumbnailObjectKey = decodeURIComponent(product.thumbnailUrl.split('.com/')[1]);
          const thumbnailCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: thumbnailObjectKey,
          });
          const thumbnailPresignedUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 600 });
          return { ...product.toJSON(), thumbnailUrl: thumbnailPresignedUrl };
        } catch (error) {
          console.error(`Error generating presigned URL for product ID ${product.id}:`, error);
          return { ...product.toJSON(), thumbnailUrl: null };
        }
      })
    );
    res.status(200).json({ products: productsWithPresignedUrls });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: '商材一覧の取得に失敗しました。' });
  }
});

router.get('/:id',
  authenticateToken,
  authorizeRoles('admin', 'subscriber'),
  checkSubscription(),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const product = await Product.findByPk(id, {
        include: [{
          model: ProductVersion,
          as: 'versions'
        }]
      });
      if (!product) {
        res.status(404).json({ message: '商材が見つかりませんでした。' });
        return;
      }
      let thumbnailPresignedUrl = null;
      if (product.thumbnailUrl) {
        const thumbnailObjectKey = decodeURIComponent(product.thumbnailUrl.split('.com/')[1]);
        const thumbnailCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: thumbnailObjectKey,
        });
        thumbnailPresignedUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 600 });
      }
      const productData = product.toJSON();
      productData.thumbnailUrl = thumbnailPresignedUrl;
      res.status(200).json({ product: productData });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ message: '商材詳細の取得に失敗しました。' });
    }
  }
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('subscriber', 'provider', 'admin'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        res.status(404).json({ message: '商材が見つかりませんでした。' });
        return;
      }
      const fileKey = product.fileUrl ? product.fileUrl.split('.com/')[1] : null;
      const thumbnailKey = product.thumbnailUrl ? product.thumbnailUrl.split('.com/')[1] : null;
      if (fileKey || thumbnailKey) {
        await Promise.all([
          fileKey
            ? s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME!, Key: fileKey }))
            : Promise.resolve(),
          thumbnailKey
            ? s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME!, Key: thumbnailKey }))
            : Promise.resolve(),
        ]);
      }
      await ProductVersion.destroy({ where: { productId: id } });
      await product.destroy();
      res.status(200).json({ message: '商材を削除しました。' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: '商材の削除に失敗しました。' });
    }
  }
);

router.get('/stream/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      res.status(404).json({ message: '商材が見つかりませんでした。' });
      return;
    }
    if (!product.fileUrl) {
      res.status(400).json({ message: 'ファイルURLが存在しません。' });
      return;
    }
    const urlParts = product.fileUrl.split('.com/');
    if (urlParts.length !== 2) {
      res.status(400).json({ message: '無効なファイルURLです。' });
      return;
    }
    const objectKey = decodeURIComponent(urlParts[1]);
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: objectKey,
    });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 });
    res.status(200).json({ presignedUrl });
  } catch (error) {
    console.error('Error generating presigned URL for streaming:', error);
    res.status(500).json({ message: '動画のストリーミングURL生成に失敗しました。' });
  }
});

export default router;
