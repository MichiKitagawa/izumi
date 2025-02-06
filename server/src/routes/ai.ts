// server/src/routes/ai.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import checkSubscription from '../middleware/checkSubscription';
import AIFactory from '../../../shared/services/aiFactory';
import { Product, ProductVersion } from '../models';

const router = Router();

/**
 * 音声からテキストへの変換
 * リクエストボディ:
 *   - audioContent: base64エンコードされた音声データ
 */
router.post('/speech-to-text', authenticateToken, checkSubscription('ai_usage_limit'), async (req: Request, res: Response) => {
  const { audioContent } = req.body;
  const speechService = AIFactory.getSpeechToTextService();

  try {
    const transcription = await speechService.transcribe(Buffer.from(audioContent, 'base64'));
    res.status(200).json({ transcription });
  } catch (error) {
    console.error('Speech-to-Text error:', error);
    res.status(500).json({ message: 'Speech-to-Text conversion failed.' });
  }
});

/**
 * テキストから音声への変換
 * リクエストボディ:
 *   - text: 合成するテキスト
 *   - languageCode: 言語コード（※現状はサービス側で固定している場合もあり）
 */
router.post('/text-to-speech', authenticateToken, checkSubscription('ai_usage_limit'), async (req: Request, res: Response) => {
  const { text, languageCode } = req.body;
  const ttsService = AIFactory.getTextToSpeechService();

  try {
    // languageCode に応じた変換（※必要なら事前に「話し言葉変換処理」を追加）
    const audioBuffer = await ttsService.synthesize(text);
    res.set('Content-Type', 'audio/mpeg');
    res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('Text-to-Speech error:', error);
    res.status(500).json({ message: 'Text-to-Speech conversion failed.' });
  }
});

/**
 * 翻訳処理（指定の商品ID の htmlContent を翻訳し、ProductVersion に保存）
 * エンドポイント: POST /translate/:id
 * URL パラメータ:
 *   - id: 商品のID
 * リクエストボディ:
 *   - languageCode: 変換先の言語コード（例：'en'）
 */
router.post('/translate/:id', authenticateToken, checkSubscription('ai_usage_limit'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { languageCode } = req.body;

  if (!languageCode) {
    res.status(400).json({ message: 'languageCodeが必要です。' });
    return;
  }

  try {
    // 対象商品の取得（タイトル、説明、htmlContent を含む）
    const product = await Product.findByPk(Number(id), {
      attributes: ['id', 'title', 'description', 'htmlContent']
    });

    if (!product) {
      res.status(404).json({ message: '商材が見つかりませんでした。' });
      return;
    }

    // 既に翻訳済みバージョンが存在する場合はそれを返却
    const existingVersion = await ProductVersion.findOne({
      where: { productId: Number(id), dataType: 'text', languageCode }
    });

    if (existingVersion) {
      res.status(200).json({ translatedHtmlContent: existingVersion.htmlContent });
      return;
    }

    // 翻訳処理の実施
    const translationService = AIFactory.getTranslationService();

    // 必要に応じてタイトルや説明も翻訳可能だが、ここでは htmlContent のみを対象とする
    const translatedHtmlContent = product.htmlContent
      ? await translationService.translate(product.htmlContent, languageCode)
      : null;

    // 翻訳結果を新たな ProductVersion として保存（テキスト型、URLは不要）
    const newVersion = await ProductVersion.create({
      productId: Number(id),
      dataType: 'text',
      languageCode,
      fileUrl: null,
      fileType: null,
      htmlContent: translatedHtmlContent,
      isOriginal: false,
    });

    console.log('Translated version saved:', newVersion);
    res.status(201).json({ translatedHtmlContent });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ message: 'Failed to process translation request.' });
  }
});

export default router;
