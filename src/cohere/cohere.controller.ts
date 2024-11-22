import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CohereService } from './cohere.service';

@Controller('cohere')
export class CohereController {
  constructor(private readonly cohereService: CohereService) {}

  @Post('generate-cahier-de-charge')
  async generateCahierDeCharge(@Body() body: { sections: { name: string; prompt: string }[] }) {
    if (!body.sections || body.sections.length === 0) {
      throw new HttpException(
        'Invalid request: sections array is required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const results = [];
    for (const section of body.sections) {
      try {
        // Generate content for the current section
        const content = await this.cohereService.generateContentForSection(
          section.name,
          section.prompt,
        );
        results.push({ section: section.name, content, success: true });
      } catch (error) {
        // Handle errors for specific sections
        results.push({
          section: section.name,
          error: error.message,
          success: false,
        });
      }
    }

    // Return all results
    return {
      success: true,
      sections: results,
    };
  }
}
