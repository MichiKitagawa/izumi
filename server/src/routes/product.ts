// src/routes/product.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import { Product, ProductVersion } from '../models';
import dotenv from 'dotenv';
import * as path from 'path';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import pdfParse from 'pdf-parse';
import AIFactory from '../../../shared/services/aiFactory';
import checkSubscription from '../middleware/checkSubscription';

dotenv.config();

const router = Router();

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

router.post(
  '/upload',
  authenticateToken,
  authorizeRoles('provider', 'editor', 'subscriber'),
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  async (req: Request, res: Response): Promise<void> => {
    console.log('Received upload request');
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

      let htmlContent: string | null = null;
      if (file.mimetype === 'application/pdf') {
        const pdfBuffer = file.buffer;
        const parsedData = await pdfParse(pdfBuffer);
        const extractedText = parsedData.text;
        htmlContent = `<div>${extractedText.replace(/\n/g, '<br>')}</div>`;
      }

      const product = await Product.create({
        title,
        description,
        category,
        fileUrl: fileUrl,
        thumbnailUrl: thumbnailUrl,
        fileType: file.mimetype.split('/')[1],
        fileSize: file.size,
        providerId: req.user.id,
        htmlContent,
      });

      await ProductVersion.create({
        productId: product.id,
        dataType: 'original',
        languageCode: 'ja',
        versionData: {
          title: product.title,
          description: product.description,
          htmlContent: product.htmlContent,
          fileUrl: product.fileUrl,
          fileType: product.fileType,
        },
        isOriginal: true,
      });

      res.status(201).json({ message: 'Product uploaded successfully.', product });
    } catch (error) {
      console.error('File upload or parsing error:', error);
      res.status(500).json({ message: 'File upload failed.' });
    }
  }
);

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

router.post('/:id/translate',
  authenticateToken,
  authorizeRoles('provider', 'editor', 'subscriber'),
  checkSubscription('ai_usage_limit'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { languageCode } = req.body;
    if (!languageCode) {
      res.status(400).json({ message: 'languageCodeが必要です。' });
      return;
    }
    try {
      console.log('Fetching product with ID:', id);
      const product = await Product.findByPk(Number(id), {
        attributes: ['id', 'title', 'description', 'htmlContent'],
      });
      if (!product) {
        res.status(404).json({ message: '商材が見つかりませんでした。' });
        return;
      }
      console.log('Product found:', product);
      const existingVersion = await ProductVersion.findOne({
        where: { productId: Number(id), dataType: 'translation', languageCode },
      });
      if (existingVersion) {
        const versionData = existingVersion.versionData as { title: string; description: string; htmlContent: string | null };
        res.status(200).json({
          translatedTitle: versionData.title,
          translatedDescription: versionData.description,
          translatedHtmlContent: versionData.htmlContent,
        });
        return;
      }
      const translationService = AIFactory.getTranslationService();
      console.log('Translating title:', product.title);
      const translatedTitle = await translationService.translate(product.title, languageCode);
      console.log('Translating description:', product.description);
      const translatedDescription = await translationService.translate(product.description, languageCode);
      const translatedHtmlContent = product.htmlContent
        ? await translationService.translate(product.htmlContent, languageCode)
        : null;
      const versionData = {
        title: translatedTitle,
        description: translatedDescription,
        htmlContent: translatedHtmlContent,
      };
      console.log('Saving translated version to product_versions');
      const newVersion = await ProductVersion.create({
        productId: Number(id),
        dataType: 'translation',
        languageCode,
        versionData,
        isOriginal: false,
      });
      console.log('Translated version saved:', newVersion);
      res.status(201).json({
        translatedTitle,
        translatedDescription,
        translatedHtmlContent,
      });
    } catch (error) {
      console.error('Error in translation process:', error);
      res.status(500).json({ message: 'Failed to process translation request.' });
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

// [新規追加] 動画再生用presigned URL生成エンドポイント
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
