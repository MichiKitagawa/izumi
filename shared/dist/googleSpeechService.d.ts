import { SpeechToTextService } from './aiService';
declare class GoogleSpeechService implements SpeechToTextService {
    private client;
    constructor();
    transcribe(audioBuffer: Buffer): Promise<string>;
}
export default GoogleSpeechService;
