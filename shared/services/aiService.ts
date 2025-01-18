// src/services/aiService.ts
export interface AIService {
  generateText(prompt: string): Promise<string>;
  translate(text: string, targetLanguage: string): Promise<string>;
}

export interface SpeechToTextService {
  transcribe(audioBuffer: Buffer): Promise<string>;
}

export interface TextToSpeechService {
  synthesize(text: string): Promise<Buffer>;
}
