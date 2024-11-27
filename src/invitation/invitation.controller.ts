import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import mongoose from 'mongoose';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('send')
  async sendInvitation(
    @Body('managerId') managerId: mongoose.Types.ObjectId,
    @Body('inviteeId') inviteeId: mongoose.Types.ObjectId,
  ) {
    return this.invitationService.sendInvitation(managerId, inviteeId);
  }

  @Patch('respond/:id')
  async respondToInvitation(
    @Param('id') invitationId: string,
    @Body('inviteeId') inviteeId: string,
    @Body('status') status: 'Accepted' | 'Declined',
  ) {
    return this.invitationService.respondToInvitation(
      invitationId,
      inviteeId,
      status,
    );
  }
}
