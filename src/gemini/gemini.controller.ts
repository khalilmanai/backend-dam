import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('test')
async testRoute(): Promise<string> {
  return 'Gemini route is working!';
}


  @Post('generate-cahier-de-charge')
  async generateCahierDeCharge(@Body() body: { prompt: string }): Promise<any> {
    if (!body.prompt) {
      throw new HttpException(
        'Invalid request: "prompt" is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const content = await this.geminiService.generateCahierDeCharge(body.prompt);
      return { success: true, content };
    } catch (error) {
      throw new HttpException(
        `Gemini API Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
