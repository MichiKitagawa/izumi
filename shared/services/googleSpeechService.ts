// shared/services/googleSpeechService.ts
import { SpeechClient, protos } from '@google-cloud/speech'; // 修正
import { SpeechToTextService } from './aiService';

class GoogleSpeechService implements SpeechToTextService {
  private client: SpeechClient;

  constructor() {
    this.client = new SpeechClient();
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    const audio = {
      content: audioBuffer.toString('base64'),
    };
    const config: protos.google.cloud.speech.v1.IRecognitionConfig = { // 修正
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16, // 修正
      languageCode: 'ja-JP',
    };
    const request: protos.google.cloud.speech.v1.IRecognizeRequest = { // 修正
      audio,
      config,
    };

    const [response] = await this.client.recognize(request);
    const transcription = response.results
      ?.map((result: protos.google.cloud.speech.v1.ISpeechRecognitionResult) => result.alternatives?.[0]?.transcript)
      .join('\n');
    return transcription || '';
  }
}

export default GoogleSpeechService;
