// src/services/googleSpeechService.ts
import { SpeechToTextService } from './aiService';
import speech from '@google-cloud/speech';

class GoogleSpeechService implements SpeechToTextService {
  private client: speech.SpeechClient;

  constructor() {
    this.client = new speech.SpeechClient();
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    const audio = {
      content: audioBuffer.toString('base64'),
    };
    const config = {
      encoding: 'LINEAR16',
      languageCode: 'ja-JP', // 必要に応じて変更
    };
    const request = {
      audio,
      config,
    };

    const [response] = await this.client.recognize(request);
    const transcription = response.results
      ?.map((result: speech.protos.google.cloud.speech.v1.ISpeechRecognitionResult) => result.alternatives?.[0]?.transcript)      .join('\n');
    return transcription || '';
  }
}

export default GoogleSpeechService;
