// src/services/googleTextToSpeechService.ts
import { TextToSpeechService } from './aiService';
import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs/promises';

class GoogleTextToSpeechService implements TextToSpeechService {
  private client: textToSpeech.TextToSpeechClient;

  constructor() {
    this.client = new textToSpeech.TextToSpeechClient();
  }

  async synthesize(text: string): Promise<Buffer> {
    const request = {
      input: { text },
      voice: { languageCode: 'ja-JP', ssmlGender: 'NEUTRAL' }, // 必要に応じて変更
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await this.client.synthesizeSpeech(request);
    return Buffer.from(response.audioContent || '');
  }
}

export default GoogleTextToSpeechService;
