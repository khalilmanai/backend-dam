// src/projects/schemas/project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Project extends Document {
  
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  budget: string;

  @Prop({ required: true })
  deadline: string;

  @Prop({ required: true })
  methodology: string; // Scrum, Agile, Waterfall, etc.

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // Corriger le type
  projectManager: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  teamMembers: Types.ObjectId[];

  // Fields to store Cahier de Charge details
  @Prop()
  cahierDeChargeContent?: string;

  @Prop()
  cahierDeChargeFileUrl?: string;
  
  // You can include tasks if necessary
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] })
  tasks: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
