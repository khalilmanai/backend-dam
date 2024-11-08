import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { User } from 'src/users/entities/user.schema';

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
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
