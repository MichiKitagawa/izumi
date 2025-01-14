import { AIService } from './aiService';
declare class DeepSeekService implements AIService {
    private openai;
    constructor();
    generateText(prompt: string): Promise<string>;
}
export default DeepSeekService;
