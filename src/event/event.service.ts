import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { join } from 'path';
import { createWriteStream, existsSync } from 'fs';
import { PDFDocument } from 'pdf-lib';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from 'src/event/entities/event.entity';


@Injectable()
export class EventsService {
  private readonly vouchersDir = join(process.cwd(), 'vouchers');

  constructor(@InjectModel(Event.name) private eventModel: Model<Event>) {
    this.ensureVouchersDirectoryExists();
  }

  private ensureVouchersDirectoryExists(): void {
    if (!existsSync(this.vouchersDir)) {
      require('fs').mkdirSync(this.vouchersDir, { recursive: true });
    }
  }

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const event = new this.eventModel(createEventDto);
    return event.save();
  }

  async getAllEvents(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async getEventById(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async getNumberOfEvents(): Promise<number> {
    return this.eventModel.countDocuments().exec();
  }



  async generateParticipationVoucher(eventId: string, userId: string): Promise<string> {
    const event = await this.getEventById(eventId);

    const pdfPath = join(this.vouchersDir, `${eventId}-${userId}.pdf`);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    page.drawText(`Voucher for Event: ${event.title}`, {
      x: 50,
      y: height - 50,
      size: 20,
    });

    const pdfBytes = await pdfDoc.save();
    require('fs').writeFileSync(pdfPath, pdfBytes);

    return pdfPath;
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.getEventById(id);
    Object.assign(event, updateEventDto);
    return event.save();
  }

  async deleteEvent(id: string): Promise<void> {
    const result = await this.eventModel.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Event not found');
    }
  }
  
}
