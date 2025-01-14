import { TextToSpeechService } from './aiService';
declare class GoogleTextToSpeechService implements TextToSpeechService {
    private client;
    constructor();
    synthesize(text: string): Promise<Buffer>;
}
export default GoogleTextToSpeechService;
