// src/services/deepseekService.ts
import { AIService } from './aiService';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class DeepSeekService implements AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: 'https://api.deepseek.com',
    });
  }

  async generateText(prompt: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      model: "deepseek-chat",
    });
    return completion.choices[0].message.content ?? '';
  }}

export default DeepSeekService;
