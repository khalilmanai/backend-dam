import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/users/entities/user.schema';
import { Invitation } from './entities/invitation.entity';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(Invitation.name) private invitationModel: Model<Invitation>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Send an invitation
  async sendInvitation(
    managerId: mongoose.Types.ObjectId,
    inviteeId: mongoose.Types.ObjectId,
  ): Promise<Invitation> {
    const manager = await this.userModel.findById(managerId);
    const invitee = await this.userModel.findById(inviteeId);

    if (!manager || !invitee) {
      throw new NotFoundException('Manager or Invitee not found');
    }

    if (manager.role !== 'PROJECT_MANAGER') {
      throw new BadRequestException(
        'Only project managers can send invitations',
      );
    }

    // Check if invitee is already in the team
    if (manager.teamOfMembers?.includes(inviteeId)) {
      throw new BadRequestException('Invitee is already a member of the team');
    }

    // Check for existing pending invitation
    const existingInvitation = await this.invitationModel.findOne({
      manager: managerId,
      invitee: inviteeId,
      status: 'Pending',
    });

    if (existingInvitation) {
      throw new BadRequestException('A pending invitation already exists');
    }

    // Create new invitation
    const invitation = new this.invitationModel({
      manager: managerId,
      invitee: inviteeId,
      status: 'Pending',
    });

    return invitation.save();
  }

  // Respond to an invitation
  async respondToInvitation(
    invitationId: string,
    inviteeId: string,
    status: 'Accepted' | 'Declined',
  ): Promise<string> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitee.toString() !== inviteeId) {
      throw new BadRequestException(
        'Unauthorized to respond to this invitation',
      );
    }

    // Update the status of the invitation
    invitation.status = status;
    await invitation.save();

    if (status === 'Accepted') {
      // Add the invitee to the manager's team
      await this.userModel.findByIdAndUpdate(invitation.manager, {
        $addToSet: { teamOfMembers: inviteeId },
      });

      return 'Invitation accepted and you have been added to the team';
    }

    return 'Invitation declined';
  }
}
