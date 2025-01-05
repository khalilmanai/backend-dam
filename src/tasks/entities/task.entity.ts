// src/tasks/schemas/task.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TaskStatus } from '../dto/create-task.dto';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  deadline: string;

  @Prop()
  budget: string;

  @Prop({ required: true, enum: TaskStatus, default: TaskStatus.TO_DO })
  status: TaskStatus;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: Types.ObjectId[];

  // Add the taskId field
  @Prop({ required: true, unique: true, default: () => new Types.ObjectId().toString() })
  taskId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
