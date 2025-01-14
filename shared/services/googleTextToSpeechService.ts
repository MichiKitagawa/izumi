// shared/services/googleTextToSpeechService.ts
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech'; // 修正
import { TextToSpeechService } from './aiService';

class GoogleTextToSpeechService implements TextToSpeechService {
  private client: TextToSpeechClient;

  constructor() {
    this.client = new TextToSpeechClient();
  }

  async synthesize(text: string): Promise<Buffer> {
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = { // 修正
      input: { text },
      voice: { languageCode: 'ja-JP', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 }, // 修正
    };

    const [response] = await this.client.synthesizeSpeech(request);
    return Buffer.from(response.audioContent || '');
  }
}

export default GoogleTextToSpeechService;
