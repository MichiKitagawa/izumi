// shared/services/aiFactory.ts
import { AIService, SpeechToTextService, TextToSpeechService } from './aiService';
import DeepSeekService from './deepseekService';
import GoogleSpeechService from './googleSpeechService';
import GoogleTextToSpeechService from './googleTextToSpeechService';

class AIFactory {
  static getAIService(): AIService {
    return new DeepSeekService();
  }

  static getSpeechToTextService(): SpeechToTextService {
    return new GoogleSpeechService();
  }

  static getTextToSpeechService(): TextToSpeechService {
    return new GoogleTextToSpeechService();
  }
}

export default AIFactory;
