import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Types } from 'mongoose';
@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] })
  projects: Types.Array<Types.ObjectId>;

  @Prop() // For storing the hashed refresh token
  refreshToken: string;

  @Prop() // For storing the password reset token
  resetToken: string;
  @Prop()
  verificationCode?: string;

  @Prop()
  verificationCodeExpiration?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
