// shared/services/googleTextToSpeechService.ts
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { TextToSpeechService } from './aiService';

class GoogleTextToSpeechService implements TextToSpeechService {
  private client: TextToSpeechClient;

  constructor() {
    this.client = new TextToSpeechClient();
  }

  async synthesize(text: string, languageCode: string = 'ja-JP'): Promise<Buffer> {
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: { languageCode, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 },
    };

    const [response] = await this.client.synthesizeSpeech(request);
    return Buffer.from(response.audioContent || '');
  }
}

export default GoogleTextToSpeechService;
