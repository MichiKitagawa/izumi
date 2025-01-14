export interface AIService {
    generateText(prompt: string): Promise<string>;
}
export interface SpeechToTextService {
    transcribe(audioBuffer: Buffer): Promise<string>;
}
export interface TextToSpeechService {
    synthesize(text: string): Promise<Buffer>;
}
