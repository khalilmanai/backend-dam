// src/webhook/webhook.controller.ts

import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Request, Response } from 'express';

@Controller('github-webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const payload = req.body;

      // Process the payload using the service
      const result = await this.webhookService.processCommit(payload);

      return res.status(HttpStatus.OK).json({ message: result });
    } catch (error) {
      console.error('Error handling webhook:', error.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to process webhook' });
    }
  }
}
