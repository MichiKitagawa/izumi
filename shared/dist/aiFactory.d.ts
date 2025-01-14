import { AIService, SpeechToTextService, TextToSpeechService } from './aiService';
declare class AIFactory {
    static getAIService(): AIService;
    static getSpeechToTextService(): SpeechToTextService;
    static getTextToSpeechService(): TextToSpeechService;
}
export default AIFactory;
