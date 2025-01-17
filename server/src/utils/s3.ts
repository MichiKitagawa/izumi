// server/src/utils/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * S3にファイルをアップロードし、公開URLを返す関数
 * @param file アップロードするファイル
 * @returns 公開URLの文字列
 */
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  try {
    console.log('Uploading file:', file.originalname);

    // ファイル拡張子を取得
    const fileExtension = file.originalname.split('.').pop();
    if (!fileExtension) {
      throw new Error('Invalid file name.');
    }

    // 一意のキーを生成
    const key = `profile-images/${uuidv4()}.${fileExtension}`;

    // PutObjectCommandのパラメータを設定
    const params = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACLを削除
    });

    // S3にオブジェクトをアップロード
    await s3.send(params);
    console.log('File uploaded successfully:', key);

    // 公開URLを生成
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image.');
  }
};
