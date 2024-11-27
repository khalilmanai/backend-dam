import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { User, UserSchema } from 'src/users/entities/user.schema';
import { Invitation, InvitationSchema } from './entities/invitation.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Invitation.name, schema: InvitationSchema },
    ]),
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
