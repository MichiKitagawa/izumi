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

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  try {
    console.log('Uploading file:', file.originalname);
    const fileExtension = file.originalname.split('.').pop();
    if (!fileExtension) {
      throw new Error('Invalid file name.');
    }
    const key = `profile-images/${uuidv4()}.${fileExtension}`;
    const params = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3.send(params);
    console.log('File uploaded successfully:', key);
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image.');
  }
};

export default s3;
