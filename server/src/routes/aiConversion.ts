// server/src/routes/aiConversion.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import checkSubscription from '../middleware/checkSubscription';
import AIFactory from '../../../shared/services/aiFactory';
import { Product, ProductVersion } from '../models';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
const router = Router();

// S3クライアント設定
const AWS_S3_REGION = process.env.AWS_S3_REGION!;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  region: AWS_S3_REGION,
});

// ユーティリティ：S3からファイルをBufferで取得
async function downloadFileFromS3(fileUrl: string): Promise<Buffer> {
  const parts = fileUrl.split('.com/');
  if (parts.length !== 2) {
    throw new Error('Invalid S3 file URL');
  }
  const key = decodeURIComponent(parts[1]);
  const command = new GetObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: key,
  });
  const response = await s3.send(command);
  if (!response.Body) throw new Error('No response body from S3');
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    (response.Body as any).on('data', (chunk: Buffer) => chunks.push(chunk));
    (response.Body as any).on('end', () => resolve(Buffer.concat(chunks)));
    (response.Body as any).on('error', reject);
  });
}

// ユーティリティ：BufferをS3にアップロードしURLを返す
async function uploadFileToS3(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const timestamp = Date.now();
  const sanitizedFileName = path.basename(fileName).replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const key = `converted/${timestamp}_${sanitizedFileName}`;
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3.send(command);
  return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
}

// ユーティリティ：テキスト整形（シンプルな例：<p>タグで囲む）
async function formatText(rawText: string): Promise<string> {
  const paragraphs = rawText.split('\n').filter(line => line.trim() !== '');
  return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
}

/**
 * ヘルパー関数：元の音声からテキスト（整形済み）を生成
 * 対象は productId と元の言語（sourceLanguage）
 */
async function generateTextFromAudio(productId: number, sourceLanguage: string): Promise<ProductVersion> {
  // 1. 対象の元音声を取得（必ず存在するはず）
  const sourceAudio = await ProductVersion.findOne({
    where: { productId, dataType: 'audio', languageCode: sourceLanguage }
  });
  if (!sourceAudio || !sourceAudio.fileUrl) {
    throw new Error(`Source audio (${sourceLanguage}) not found.`);
  }
  // 2. S3から音声ファイルをダウンロード
  const audioBuffer = await downloadFileFromS3(sourceAudio.fileUrl);
  // 3. STTで文字起こし
  const speechService = AIFactory.getSpeechToTextService();
  const rawText = await speechService.transcribe(audioBuffer);
  if (!rawText) throw new Error('STT processing failed.');
  // 4. 整形処理
  const formattedText = await formatText(rawText);
  // 5. DBに保存（dataType='text', languageCode=sourceLanguage）
  return await ProductVersion.create({
    productId,
    dataType: 'text',
    languageCode: sourceLanguage,
    fileUrl: null,
    fileType: null,
    htmlContent: formattedText,
    isOriginal: false,
  });
}

/**
 * ヘルパー関数：翻訳済みテキスト（整形済み）を生成
 * 既存の sourceTextVersion を targetLanguage に翻訳する
 */
async function translateText(productId: number, sourceLanguage: string, targetLanguage: string, sourceText: string): Promise<ProductVersion> {
  const translationService = AIFactory.getTranslationService();
  const translatedRawText = await translationService.translate(sourceText, targetLanguage);
  if (!translatedRawText) throw new Error('Translation processing failed.');
  const formattedTranslatedText = await formatText(translatedRawText);
  return await ProductVersion.create({
    productId,
    dataType: 'text',
    languageCode: targetLanguage,
    fileUrl: null,
    fileType: null,
    htmlContent: formattedTranslatedText,
    isOriginal: false,
  });
}

/**
 * ヘルパー関数：TTSによりテキストから音声を生成
 */
async function synthesizeAudioFromText(productId: number, targetLanguage: string, text: string): Promise<ProductVersion> {
  const ttsService = AIFactory.getTextToSpeechService();
  const audioBuffer = await ttsService.synthesize(text);
  if (!audioBuffer) throw new Error('TTS processing failed.');
  const audioUrl = await uploadFileToS3(audioBuffer, `converted_audio_${productId}.mp3`, 'audio/mpeg');
  return await ProductVersion.create({
    productId,
    dataType: 'audio',
    languageCode: targetLanguage,
    fileUrl: audioUrl,
    fileType: 'mp3',
    htmlContent: null,
    isOriginal: false,
  });
}

/**
 * メインの変換関数：逆順にたどって最終成果物を生成
 * 例：ユーザーが targetType (audio/text) と targetLanguage を指定して変換を要求
 */
async function getConvertedProductVersion(productId: number, targetType: 'audio' | 'text', targetLanguage: string): Promise<ProductVersion> {
  // ① 既に対象データがあるかチェック
  let targetVersion = await ProductVersion.findOne({
    where: { productId, dataType: targetType, languageCode: targetLanguage }
  });
  if (targetVersion) return targetVersion;

  // ② targetType が "audio" の場合、まずは対象言語のテキストが必要
  if (targetType === 'audio') {
    let targetTextVersion = await ProductVersion.findOne({
      where: { productId, dataType: 'text', languageCode: targetLanguage }
    });
    if (!targetTextVersion) {
      // ③ もし対象言語のテキストがない場合、まずは元のテキスト（表示中の言語）を利用
      // ここでは、商材詳細ページで表示されている元の言語を参照する前提とする
      // ※例えば、元の言語を sourceLanguage とする
      const sourceVersion = await ProductVersion.findOne({
        where: { productId }
      });
      if (!sourceVersion) throw new Error('No source version found.');
      const sourceLanguage = sourceVersion.languageCode; // ユーザー表示されている言語
      // ④ 元のテキストが存在するかチェック
      let sourceTextVersion = await ProductVersion.findOne({
        where: { productId, dataType: 'text', languageCode: sourceLanguage }
      });
      if (!sourceTextVersion) {
        // ⑤ なければ、音声や動画からSTTを実施してテキスト生成
        sourceTextVersion = await generateTextFromAudio(productId, sourceLanguage);
      }
      // ⑥ 翻訳して対象言語のテキストを生成
      targetTextVersion = await translateText(productId, sourceLanguage, targetLanguage, sourceTextVersion.htmlContent || '');
    }
    // ⑦ TTSで対象言語の音声を生成
    return await synthesizeAudioFromText(productId, targetLanguage, targetTextVersion.htmlContent || '');
  }

  // ⑧ targetType が "text" の場合
  // 対象言語のテキストがなければ、元のテキストを元に翻訳
  let targetTextVersion = await ProductVersion.findOne({
    where: { productId, dataType: 'text', languageCode: targetLanguage }
  });
  if (!targetTextVersion) {
    const sourceVersion = await ProductVersion.findOne({ where: { productId } });
    if (!sourceVersion) throw new Error('No source version found.');
    const sourceLanguage = sourceVersion.languageCode;
    let sourceTextVersion = await ProductVersion.findOne({
      where: { productId, dataType: 'text', languageCode: sourceLanguage }
    });
    if (!sourceTextVersion) {
      sourceTextVersion = await generateTextFromAudio(productId, sourceLanguage);
    }
    targetTextVersion = await translateText(productId, sourceLanguage, targetLanguage, sourceTextVersion.htmlContent || '');
  }
  return targetTextVersion;
}

/**
 * エンドポイント：POST /convert/:id
 * リクエストボディ例:
 * {
 *   "targetType": "audio",   // "audio" または "text"
 *   "targetLanguage": "en"     // 例: "en", "ja", "fr" 等
 * }
 */
router.post('/convert/:id', authenticateToken, checkSubscription('ai_usage_limit'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { targetType, targetLanguage } = req.body;
  if (!targetType || !targetLanguage) {
    return res.status(400).json({ message: 'targetType と targetLanguage は必須です。' });
  }
  try {
    const convertedVersion = await getConvertedProductVersion(Number(id), targetType, targetLanguage);
    return res.status(200).json({ convertedVersion });
  } catch (error) {
    console.error('Error in conversion chain:', error);
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Conversion processing failed.', error: error.message });
    } else {
      return res.status(500).json({ message: 'Conversion processing failed.', error: 'An unknown error occurred' });
    }
  }
});

export default router;
