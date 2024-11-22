/*import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatgptService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Load the API URL and key from environment variables
    this.apiUrl = this.configService.get<string>(process.env.CHATGPT_API_KEY);
    this.apiKey = this.configService.get<string>(process.env.CHATGPT_API_URL);

    // Validate that both values are present
    if (!this.apiUrl || !this.apiKey) {
      throw new Error('CHATGPT_API_URL and CHATGPT_API_KEY must be set in the .env file.');
    }
  }

  async sendMessage(prompt: string): Promise<any> {
    if (!prompt || prompt.trim() === '') {
      throw new BadRequestException('Prompt cannot be empty.');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          { prompt },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data; // Return the API response data
    } catch (error) {
      console.error('Error calling ChatGPT API:', error.message || error);

      if (error.response) {
        throw new InternalServerErrorException(
          `ChatGPT API error: ${error.response.data?.message || error.response.statusText}`,
        );
      } else {
        throw new InternalServerErrorException('An unexpected error occurred while calling the ChatGPT API.');
      }
    }
  }
}*/
