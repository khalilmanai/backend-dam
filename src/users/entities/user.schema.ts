import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { UserRole } from './user.enum';
import { UserStatus } from './status.enum';

@Schema()
export class User extends Document {
  @ApiProperty({
    description: 'The unique username of the user',
    example: 'john_doe',
  })
  @Prop({ required: true, unique: true })
  username: string;

  @ApiProperty({
    description: 'The unique email address of the user',
    example: 'john@example.com',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    description: 'The hashed password of the user',
    example: 'hashedpassword123',
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    description: 'List of project IDs the user is associated with',
    type: [String],
    example: ['641d8f2f4b7e4d2d8d0f7c91', '641d8f2f4b7e4d2d8d0f7c92'],
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] })
  projects: Types.Array<Types.ObjectId>;

  @ApiProperty({
    description: 'The hashed refresh token',
    example: 'somerandomrefreshtoken',
    required: false,
  })
  @Prop()
  refreshToken?: string;

  @ApiProperty({
    description: 'Password reset token',
    example: 'somepasswordresettoken',
    required: false,
  })
  @Prop()
  resetToken?: string;

  @ApiProperty({
    description: 'Verification code sent to the user',
    example: '123456',
    required: false,
  })
  @Prop()
  verificationCode?: string;

  @ApiProperty({
    description: 'Expiration date for the verification code',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @Prop()
  verificationCodeExpiration?: Date;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
    example: UserRole.MEMBER,
  })
  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Prop({
    type: String,
  })
  image?: string;

  @ApiProperty({
    description: 'The specialty of the user (required for members)',
    example: 'Software Engineer',
    required: false,
  })
  @Prop({
    type: String,
    validate: {
      validator: function (this: User, value: string) {
        return this.role !== UserRole.MEMBER || !!value; // Specialty must exist for MEMBER
      },
      message: 'Specialty is required for users with the MEMBER role.',
    },
    required: function () {
      return this.role === UserRole.MEMBER;
    },
  })
  specialty?: string;

  @ApiProperty({
    description:
      'The team of members managed by the user (required for project managers)',
    type: [String],
    example: ['641d8f2f4b7e4d2d8d0f7c93', '641d8f2f4b7e4d2d8d0f7c94'],
    required: false,
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User' }],
    default: [],
    required: function () {
      return this.role === UserRole.PROJECT_MANAGER;
    },
  })
  teamOfMembers?: Types.Array<Types.ObjectId>;
  @ApiProperty({
    description: 'The current status of the user',
    enum: UserStatus,
    example: UserStatus.ONLINE,
  })
  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.OFFLINE,
  })
  status: UserStatus;
  @Prop({ type: String })
  fcmToken?: string; // Optional field to store FCM token
}

export const UserSchema = SchemaFactory.createForClass(User);
