import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CohereService {
  private readonly url = 'https://api.cohere.ai/generate';
  private readonly headers = {
    Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  constructor(private readonly httpService: HttpService) {}

  async generateContentForSection(section: string, prompt: string): Promise<string> {
    const body = {
      model: 'command-xlarge-nightly',
      prompt: prompt,
      max_tokens: 500, // Adjust the token limit as necessary
      temperature: 0.7,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.url, body, { headers: this.headers }),
      );

      // Log the full response for debugging purposes
      console.log('Cohere API Response:', response.data);

      // Check if 'generations' exists and contains content
      if (!response.data?.generations || response.data.generations.length === 0) {
        throw new Error(`No text generated for section: "${section}"`);
      }

      // Return the first generated text
      return response.data.generations[0].text.trim();
    } catch (error) {
      // Log the full error response for debugging
      console.error('Cohere API Error:', error.response?.data || error.message);

      // Provide a more descriptive error message
      throw new Error(
        `Cohere API call for section "${section}" failed: ${
          error.response?.data?.message || error.message || 'Unknown error'
        }`,
      );
    }
  }
}
