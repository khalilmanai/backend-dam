import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[];

  @Prop({ required: true })
  imageUrl: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
