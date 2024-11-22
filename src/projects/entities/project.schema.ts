import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Method } from './method.enum';

@Schema()
export class Project extends Document {
  @Prop({ required: true })
  projectId: number; // Unique project identifier

  @Prop({ required: true, maxlength: 100 })
  name: string; // Name of the project

  @Prop({ required: true, maxlength: 500 })
  description: string; // Brief description of the project

  @Prop({ required: true })
  startDate: Date; // Start date of the project

  @Prop({ required: true })
  endDate: Date; // End date of the project

  @Prop({ required: true, min: 0 })
  budget: number; // Budget allocated for the project

  @Prop({ required: true, enum: Method })
  method: Method; // Methodology used in the project (e.g., Kanban, XP, Scrum)

  @Prop({ type: Array, default: [] })
  tasks: string[]; // List of tasks related to the project (optional extension)
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
