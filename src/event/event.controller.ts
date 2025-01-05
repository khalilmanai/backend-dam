import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Patch,
  Delete,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './event.service';
import { Types } from 'mongoose';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.createEvent(createEventDto);
  }

  @Get()
  async getAllEvents() {
    console.log('GET /events endpoint called');
    const events = await this.eventsService.getAllEvents();
    console.log(`Returning ${events.length} events to client`);
    return events;
  }

  @Get('/count')
  async getNumberOfEvents() {
    console.log('GET /events/count endpoint called');
    const count = await this.eventsService.getNumberOfEvents();
    console.log(`Number of events: ${count}`);
    return { count };
  }

  @Get(':id')
  async getEventById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Event ID format');
    }
    return this.eventsService.getEventById(id);
  }



  @Get(':id/voucher')
  async getParticipationVoucher(
    @Param('id') eventId: string,
    @Body('userId') userId: string,
    @Res() res: Response,
  ) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException('Invalid Event ID format');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }

    try {
      const pdfPath = await this.eventsService.generateParticipationVoucher(eventId, userId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="voucher-${eventId}.pdf"`);

      return res.sendFile(pdfPath);
    } catch (error) {
      throw new BadRequestException('Failed to generate voucher');
    }
  }

  @Patch(':id')
  async updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Event ID format');
    }
    return this.eventsService.updateEvent(id, updateEventDto);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Event ID format');
    }
    return this.eventsService.deleteEvent(id);
  }
}
