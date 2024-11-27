import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Invitation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  manager: Types.ObjectId; // The manager sending the invitation

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  invitee: Types.ObjectId; // The invited member

  @Prop({
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending',
  })
  status: string; // Status of the invitation
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
