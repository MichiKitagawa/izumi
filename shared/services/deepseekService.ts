import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class DeepSeekService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not defined in the environment variables.');
    }

    this.openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    });
  }

  async generateText(prompt: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      model: "deepseek-chat",
    });
    return completion.choices[0].message.content ?? '';
  }

  async translate(text: string, targetLanguage: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      messages: [
        { role: "system", content: `You are a translator. Translate the following text to ${targetLanguage}.` },
        { role: "user", content: text },
      ],
      model: "deepseek-chat",
    });
    return completion.choices[0].message.content ?? '';
  }
}

export default DeepSeekService;