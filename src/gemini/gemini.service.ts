import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeminiService {
  private readonly model = 'gemini-1.5-flash';
  private readonly url = 'https://generativelanguage.googleapis.com/v1beta2/models'; // Base URL for Gemini API
  private readonly apiKey = process.env.GEMINI_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  async generateCahierDeCharge(prompt: string): Promise<string> {
    // Log the start of the request and the prompt
    console.log('Generating Cahier de Charge with prompt:', prompt);

    const endpoint = `${this.url}/${this.model}:generateText`;
    const body = {
      prompt: { text: prompt },
    };
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      // Log the request payload and headers
      console.log('Sending request to Gemini API with body:', body);
      console.log('Using headers:', headers);

      const response = await firstValueFrom(
        this.httpService.post(endpoint, body, { headers }),
      );

      // Log the full response from Gemini API
      console.log('Gemini API Response:', response.data);

      // Handle the API response and ensure content exists
      const generatedText = response.data?.candidates?.[0]?.output;
      if (!generatedText) {
        throw new Error('No content generated or invalid response from Gemini API.');
      }

      // Return the generated content
      console.log('Generated text from Gemini API:', generatedText);
      return generatedText;
    } catch (error) {
      // Log the error and detailed response if available
      console.error('Gemini API Error:', error.response?.data || error.message);

      // Throw a more descriptive error message
      throw new Error(
        `Failed to generate content from Gemini API: ${error.response?.data?.message || error.message || 'Unknown error'}`,
      );
    }
  }
}
