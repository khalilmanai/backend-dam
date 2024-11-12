import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { User } from 'src/users/entities/user.schema';
import { Method } from './method.enum';

@Schema()
export class Project extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [String] })
  teams: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true, enum: Method })
  method: Method;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
