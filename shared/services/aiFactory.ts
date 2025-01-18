import { AIService, SpeechToTextService, TextToSpeechService } from './aiService';
import DeepSeekService from './deepseekService';
import GoogleSpeechService from './googleSpeechService';
import GoogleTextToSpeechService from './googleTextToSpeechService';

class AIFactory {
  // AIチャットサービス
  static getAIService(): AIService {
    return new DeepSeekService();
  }

  // 翻訳サービス
  static getTranslationService(): AIService {
    return new DeepSeekService(); // 同じDeepSeekServiceを利用
  }

  // 音声認識サービス
  static getSpeechToTextService(): SpeechToTextService {
    return new GoogleSpeechService();
  }

  // 音声合成サービス
  static getTextToSpeechService(): TextToSpeechService {
    return new GoogleTextToSpeechService();
  }
}

export default AIFactory;
