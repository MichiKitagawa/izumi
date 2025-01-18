// src/routes/product.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { authenticateToken, authorizeRoles } from '../middleware/authenticate';
import Product from '../models/Product';
import dotenv from 'dotenv';
import path from 'path';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import pdfParse from 'pdf-parse';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import Translation from '../models/Translation'; // Translationモデルをインポート
import AIFactory from '../../../shared/services/aiFactory';

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

      // PDF解析とHTML変換
      let htmlContent: string | null = null;
      if (file.mimetype === 'application/pdf') {
        const pdfBuffer = file.buffer;
        const parsedData = await pdfParse(pdfBuffer); // PDFを解析してテキストを抽出
        const extractedText = parsedData.text;

        // テキストをHTML形式に変換
        htmlContent = `<div>${extractedText.replace(/\n/g, '<br>')}</div>`;
      }

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
        htmlContent, // HTMLコンテンツを保存
      });

      // デバッグログ
      console.log('Product created:', product);
      console.log('Thumbnail URL:', thumbnailUrl);
      console.log('File URL:', fileUrl);

      res.status(201).json({ message: 'Product uploaded successfully.', product });
    } catch (error) {
      console.error('File upload or parsing error:', error);

      // S3アップロードが失敗した場合、データベースへの保存は行われない
      res.status(500).json({ message: 'File upload failed.' });
    }
  }
);

// 商材一覧取得API
router.get('/list', async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'title', 'description', 'thumbnailUrl'], // 必要な属性のみ
    });

    // サムネイルのプリサインドURLを生成
    const productsWithPresignedUrls = await Promise.all(
      products.map(async (product) => {
        try {
          // サムネイルURLが無い場合は、デフォルトのURLまたは空で返す
          if (!product.thumbnailUrl) {
            console.warn(`Product with ID ${product.id} has no thumbnail URL.`);
            return {
              ...product.toJSON(),
              thumbnailUrl: null, // ここで「null」を設定
            };
          }

          const thumbnailObjectKey = decodeURIComponent(product.thumbnailUrl.split('.com/')[1]);
          const thumbnailCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: thumbnailObjectKey,
          });

          const thumbnailPresignedUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 600 }); // 10分の有効期限

          return {
            ...product.toJSON(),
            thumbnailUrl: thumbnailPresignedUrl,
          };
        } catch (err) {
          console.error(`Error generating presigned URL for product ID ${product.id}:`, err);
          return {
            ...product.toJSON(),
            thumbnailUrl: null, // エラー場合も空に返す
          };
        }
      })
    );

    res.status(200).json({ products: productsWithPresignedUrls });
  } catch (error) {
    console.error('Error fetching product list:', error);
    res.status(500).json({ message: '商材一覧の取得に失敗しました。' });
  }
});



// フィーチャー商材取得API
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'description', 'thumbnailUrl'], // 必要な属性のみ
    });

    if (!product) {
      return res.status(404).json({ message: 'フィーチャー商材が見つかりませんでした。' });
    }

    // サムネイルのプリサインドURLを生成
    const thumbnailObjectKey = decodeURIComponent(product.thumbnailUrl.split('.com/')[1]);
    const thumbnailCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: thumbnailObjectKey,
    });

    const thumbnailPresignedUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 600 }); // 10分の有効期限

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

// ユーザーごとの商材一覧取得API
router.get('/user-products', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const products = await Product.findAll({
      where: { providerId: userId }, // 正しい条件
      attributes: ['id', 'title', 'description', 'thumbnailUrl', 'createdAt'], // 必要な属性のみ
    });

    // サムネイルのプリサインドURLを生成
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

// 商材詳細取得API
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      attributes: [
        'id', 
        'title', 
        'description', 
        'category', 
        'thumbnailUrl', 
        'fileType', 
        'fileSize', 
        'providerId', 
        'createdAt',
        'htmlContent',
      ],
    });

    if (!product) {
      return res.status(404).json({ message: '商材が見つかりませんでした。' });
    }

    // サムネイルのプリサインドURL生成
    const thumbnailObjectKey = decodeURIComponent(product.thumbnailUrl.split('.com/')[1]);
    const thumbnailCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: thumbnailObjectKey,
    });
    const thumbnailPresignedUrl = await getSignedUrl(s3, thumbnailCommand, { expiresIn: 600 });

    // レスポンスを返す
    res.status(200).json({
      product: {
        ...product.toJSON(),
        thumbnailUrl: thumbnailPresignedUrl,
      },
    });
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    res.status(500).json({ message: '商材詳細の取得に失敗しました。' });
  }
});

// 商材の翻訳API
router.post('/:id/translate', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { languageCode } = req.body;

  if (!languageCode) {
    return res.status(400).json({ message: 'languageCodeが必要です。' });
  }

  try {
    // 商材を取得
    console.log('Fetching product with ID:', id);
    const product = await Product.findByPk(Number(id), {
      attributes: ['id', 'title', 'description', 'htmlContent'],
    });

    if (!product) {
      return res.status(404).json({ message: '商材が見つかりませんでした。' });
    }

    console.log('Product found:', product);

    // 翻訳済みデータを確認
    const existingTranslation = await Translation.findOne({
      where: { productId: Number(id), languageCode },
    });

    if (existingTranslation) {
      // 翻訳済みデータを返す
      return res.status(200).json({
        translatedTitle: existingTranslation.translatedTitle,
        translatedDescription: existingTranslation.translatedDescription,
        translatedHtmlContent: existingTranslation.translatedHtmlContent, // 翻訳済みHTMLを返す
      });
    }

    // 翻訳サービスを利用
    const translationService = AIFactory.getTranslationService();
    console.log('Translating title:', product.title);
    const translatedTitle = await translationService.translate(product.title, languageCode);
    console.log('Translating description:', product.description);
    const translatedDescription = await translationService.translate(product.description, languageCode);
    const translatedHtmlContent = product.htmlContent
      ? await translationService.translate(product.htmlContent, languageCode) // HTMLコンテンツの翻訳
      : null;

    // 翻訳結果を保存
    console.log('Saving translation to database');
    const newTranslation = await Translation.create({
      productId: Number(id),
      languageCode,
      translatedTitle,
      translatedDescription,
      translatedHtmlContent, // 翻訳済みHTMLを保存
    });

    console.log('Translation saved:', newTranslation);

    res.status(201).json({
      translatedTitle: newTranslation.translatedTitle,
      translatedDescription: newTranslation.translatedDescription,
      translatedHtmlContent: newTranslation.translatedHtmlContent,
    });
  } catch (error) {
    console.error('Error in translation process:', error);
    res.status(500).json({ message: 'Failed to process translation request.' });
  }
});

// 商材削除API
router.delete('/:id', authenticateToken, authorizeRoles('subscriber', 'provider', 'admin'), async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);

    // 商品が存在しない場合
    if (!product) {
      return res.status(404).json({ message: '商材が見つかりませんでした。' });
    }

    // URLの確認（存在しない場合にエラーハンドリング）
    const fileKey = product.fileUrl ? product.fileUrl.split('.com/')[1] : null;
    const thumbnailKey = product.thumbnailUrl ? product.thumbnailUrl.split('.com/')[1] : null;

    // S3からの削除を実行
    if (fileKey || thumbnailKey) {
      await Promise.all([
        fileKey && s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME!, Key: fileKey })),
        thumbnailKey && s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME!, Key: thumbnailKey })),
      ]);
    }

    // データベースから商材を削除
    await product.destroy();

    res.status(200).json({ message: '商材を削除しました。' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: '商材の削除に失敗しました。' });
  }
});



export default router;
