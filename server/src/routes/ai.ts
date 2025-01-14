// server/src/routes/ai.ts
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import AIFactory from '../../../shared/services/aiFactory';

const router = Router();

// 音声からテキストへの変換
router.post('/speech-to-text', authenticateToken, async (req: Request, res: Response) => {
  const { audioContent } = req.body; // base64エンコードされた音声データ
  const speechService = AIFactory.getSpeechToTextService();

  try {
    const transcription = await speechService.transcribe(Buffer.from(audioContent, 'base64'));
    res.status(200).json({ transcription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Speech-to-Text conversion failed.' });
  }
});

// テキストから音声への変換
router.post('/text-to-speech', authenticateToken, async (req: Request, res: Response) => {
  const { text, languageCode } = req.body;
  const ttsService = AIFactory.getTextToSpeechService();

  try {
    const audioBuffer = await ttsService.synthesize(text);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Text-to-Speech conversion failed.' });
  }
});

export default router;
