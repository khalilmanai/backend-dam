/*import { Controller, Post, Body } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';

@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  @Post('send')
  async sendMessage(@Body('prompt') prompt: string): Promise<any> {
    return this.chatgptService.sendMessage(prompt);
  }
}*/
